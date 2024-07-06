#![allow(unused_imports, dead_code)]
use crate::db::{models::RefrigeratorItem, operations::insert_refrigerator_item};
pub mod types;
use futures::stream::StreamExt;
use paho_mqtt as mqtt;
use reqwest::Error;
use sqlx::PgPool;
use std::env;
use std::{process, time::Duration};
pub use types::{ApiResponse, ApiResponseData, Product, RefrigeratorItemFromMqtt};

const TOPIC: &str = "rawScan";
const QOS: i32 = 1;

pub struct MqttClient {
    pool: PgPool,
    client: mqtt::AsyncClient,
}

impl MqttClient {
    pub async fn new(pool: PgPool) -> Self {
        // let host = "mqtt://10.0.0.7:1883";
        let host = "mqtt://192.168.1.168:1883";

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
        let item_mqtt: RefrigeratorItemFromMqtt =
            serde_json::from_str(&payload).unwrap_or_else(|e| {
                println!("Failed to parse message payload: {:?}", e);
                RefrigeratorItemFromMqtt {
                    barcode: "XXXXX".to_string(),
                    expiration_date: "".to_string(),
                }
            });

        let item_product = match self.fetch_product(&item_mqtt.barcode).await {
            Ok(product) => product,
            Err(_) => return,
        };

        let item = RefrigeratorItem {
            barcode: item_mqtt.barcode,
            expiration_date: Self::parse_date(&item_mqtt.expiration_date),
            name: item_product.name,
            quantity: 1,
            weight: String::from(
                item_product.weight.unwrap_or(0.0).to_string()
                    + &item_product.weight_unit.unwrap_or("g".to_string()),
            ),
            nutrition: sqlx::types::Json::from(item_product.nutrition.unwrap_or_default()),
            image_url: item_product.image.unwrap_or_default(),
        };
        let result = insert_refrigerator_item(&self.pool, item).await;
        match result {
            Ok(_) => println!("Inserted item from MQTT message successfully."),
            Err(e) => println!("Failed to insert item from MQTT message: {:?}", e),
        }
    }
    fn parse_date(date: &str) -> chrono::NaiveDate {
        chrono::NaiveDate::parse_from_str(date, "%d-%m-%Y").unwrap_or_else(|e| {
            println!("Failed to parse date: {:?}", e);
            chrono::NaiveDate::from_ymd(2024, 1, 1)
        })
    }

    async fn fetch_product(&self, ean: &str) -> Result<Product, Error> {
        let url = format!("https://kassal.app/api/v1/products/ean/{}", ean);
        let client = reqwest::Client::new();
        let bearer_token = env::var("BEARER_TOKEN").unwrap_or_default();

        let response = client
            .get(&url)
            .bearer_auth(bearer_token)
            .send()
            .await?
            .json::<ApiResponse>()
            .await;

        match response {
            Ok(response) => {
                let valid_product = response
                    .data
                    .products
                    .into_iter()
                    .find(|product| product.weight.is_some());
                let nutrition = response.data.nutrition;
                let valid_product = valid_product.map(|product| Product {
                    name: product.name,
                    weight: product.weight,
                    weight_unit: product.weight_unit,
                    nutrition: Some(nutrition),
                    image: product.image,
                });
                return Ok(valid_product.unwrap());
            }
            Err(e) => {
                println!("Failed to fetch product: {:?}", e);
                return Err(e);
            }
        };
    }
}
