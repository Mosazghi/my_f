use crate::db::{models::RefrigeratorItem, operations::insert_refrigerator_item};
use crate::db::{operations::get_refrigerator_item, operations::update_refrigerator_item_quantity};
pub mod types;
use crate::util::parse_date;
use futures::stream::StreamExt;
use paho_mqtt::{self as mqtt};
use sqlx::PgPool;
use std::env;
use std::{process, time::Duration};
use types::{ApiResponse, MqttResponse, Product, RefrigeratorItemFromMqtt};

const TOPIC: &str = "rawScan";
const QOS: i32 = 1;

pub struct MqttClient {
    pool: PgPool,
    client: mqtt::AsyncClient,
}

impl MqttClient {
    pub async fn new(pool: PgPool) -> Self {
        let host = "mqtt://10.0.0.7:1883";
        // let host = "mqtt://192.168.1.168:1883";

        println!("Connecting to the MQTT broker at {}", host);

        let create_opts = mqtt::CreateOptionsBuilder::new_v3()
            .server_uri(host)
            .client_id("backend")
            .finalize();

        let client = mqtt::AsyncClient::new(create_opts).unwrap_or_else(|e| {
            println!("Error creating the client: {:?}", e);
            process::exit(1);
        });

        MqttClient { pool, client }
    }

    pub async fn start(&mut self) {
        if let Err(err) = async {
            let mut strm = self.client.get_stream(25);

            let conn_opts = mqtt::ConnectOptionsBuilder::new_v3()
                .keep_alive_interval(Duration::from_secs(30))
                .clean_session(false)
                .finalize();

            self.client.connect(conn_opts).await?;

            self.client.subscribe(TOPIC, QOS).await?;
            println!("Subscribed to topics: {:?}", TOPIC);

            let mut rconn_attempt: usize = 0;

            while let Some(msg_opt) = strm.next().await {
                if let Some(msg) = msg_opt {
                    let topic = msg.topic();
                    let payload = msg.payload_str();
                    println!("Received a message on topic '{}': {}\n", topic, payload);
                    self.handle_message(msg).await;
                } else {
                    println!("Lost connection. Attempting reconnect...");
                    while let Err(err) = self.client.reconnect().await {
                        rconn_attempt += 1;
                        println!("Error reconnecting #{}: {}", rconn_attempt, err);
                        tokio::time::sleep(Duration::from_secs(1)).await;
                    }
                    println!("Reconnected.");
                }
            }

            Ok::<(), mqtt::Error>(())
        }
        .await
        {
            eprintln!("{}", err);
        }
    }

    async fn handle_message(&self, msg: mqtt::Message) {
        let payload = msg.payload_str();

        let item_mqtt: RefrigeratorItemFromMqtt = match serde_json::from_str(&payload) {
            Ok(item) => item,
            Err(e) => {
                println!("Failed to parse message payload: {:?}", e);
                return;
            }
        };

        let item = get_refrigerator_item(&self.pool, &item_mqtt.barcode).await;
        match item {
            Some(mut item) => {
                println!("Item already exists in the database.");
                let _ = update_refrigerator_item_quantity(&self.pool, &item_mqtt.barcode, {
                    item.quantity += 1;
                    item.quantity
                })
                .await;

                return;
            }
            None => (),
        }

        let item_product = match self.fetch_product(&item_mqtt.barcode).await {
            Some(product) => product,
            None => {
                let msg = MqttResponse {
                    message: "Product not found!".to_string(),
                };

                let msg = serde_json::to_string(&msg).unwrap();
                let msg = mqtt::Message::new("scanResult", msg, mqtt::QOS_1);
                if let Err(e) = self.client.publish(msg).await {
                    println!("Failed to publish message: {:?}", e);
                }
                return;
            }
        };

        let item = RefrigeratorItem {
            barcode: item_mqtt.barcode,
            expiration_date: parse_date(&item_mqtt.expiration_date),
            name: item_product.name,
            quantity: 1,
            weight: String::from(
                item_product.weight.unwrap_or(0.0).to_string()
                    + &item_product.weight_unit.unwrap_or("g".to_string()),
            ),
            nutrition: sqlx::types::Json::from(item_product.nutrition.unwrap_or_default()),
            image_url: item_product.image.unwrap_or_default(),
        };

        let result = insert_refrigerator_item(&self.pool, &item).await;
        match result {
            Ok(_) => {
                println!("Inserted item from MQTT message successfully.");
                let item_json = serde_json::to_string(&item).unwrap();

                let msg = mqtt::Message::new("newScan", item_json, mqtt::QOS_1);
                if let Err(e) = self.client.publish(msg).await {
                    println!("Failed to publish message: {:?}", e);
                }

                let msg = MqttResponse {
                    message: "Success!".to_string(),
                };

                let msg = serde_json::to_string(&msg).unwrap();

                let msg = mqtt::Message::new("scanResult", msg, mqtt::QOS_1);
                if let Err(e) = self.client.publish(msg).await {
                    println!("Failed to publish message: {:?}", e);
                }
                return;
            }
            Err(e) => println!("Failed to insert item from MQTT message: {:?}", e),
        }
    }

    async fn fetch_product(&self, ean: &str) -> Option<Product> {
        let url = format!("https://kassal.app/api/v1/products/ean/{}", ean);
        let client = reqwest::Client::new();
        let bearer_token = env::var("BEARER_TOKEN").unwrap_or_default();

        let response = client
            .get(&url)
            .bearer_auth(bearer_token)
            .send()
            .await
            .expect("Failed to send request")
            .json::<ApiResponse>()
            .await;

        match response {
            Ok(response) => {
                let valid_product = response
                    .data
                    .products
                    .clone()
                    .into_iter()
                    .find(|product| product.weight.is_some())
                    .or_else(|| response.data.products.into_iter().next());

                let nutrition = response.data.nutrition;
                let valid_product = valid_product.map(|product| Product {
                    name: product.name,
                    weight: product.weight,
                    weight_unit: product.weight_unit,
                    nutrition: Some(nutrition),
                    image: product.image,
                });
                println!("Product found: {:?}", valid_product);
                return Some(valid_product.unwrap());
            }
            Err(_) => {
                println!("Product not found.");
                return None;
            }
        };
    }
}
