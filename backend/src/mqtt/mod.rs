use crate::db::operations::{get_refrigerator_item, update_refrigerator_item};
use crate::db::UpdateRefrigeratorItem;
use crate::db::{models::RefrigeratorItem, operations::insert_refrigerator_item};
pub mod types;
use crate::util::parse_date;
use crate::util::publish_json_response;
use futures::stream::StreamExt;
use paho_mqtt::{self as mqtt};
use serde::Serialize;
use sqlx::PgPool;
use std::env;
use std::{process, time::Duration};
use types::{ApiResponse, Product, RefrigeratorItemFromMqtt};

const TOPIC_NEW_SCAN: &str = "newScan";
const TOPIC_SCAN_RESULT: &str = "scanResult";
const QOS: i32 = 1;

pub struct MqttClient {
    pool: PgPool,
    client: mqtt::AsyncClient,
}

#[derive(Debug, Serialize)]
enum SuceessType {
    Success,
    Info,
    Error,
}

#[derive(Debug, Serialize)]
struct ScanResult {
    message: String,
    success_type: SuceessType,
}

impl MqttClient {
    pub async fn new(pool: PgPool) -> Self {
        let host = "ws://localhost:8080";
        println!("Connecting to the MQTT broker at {}", host);

        let create_opts = mqtt::CreateOptionsBuilder::new_v3()
            .server_uri(host)
            .client_id("backend")
            .finalize();

        let client = mqtt::AsyncClient::new(create_opts).unwrap_or_else(|e| {
            eprintln!("Error creating the client: {:?}", e);
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

            self.client.subscribe(TOPIC_NEW_SCAN, QOS).await?;
            println!("Subscribed to topics: {:?}", TOPIC_NEW_SCAN);

            let mut rconn_attempt: usize = 0;

            while let Some(msg_opt) = strm.next().await {
                if let Some(msg) = msg_opt {
                    let topic = msg.topic();
                    let payload = msg.payload_str();
                    println!("Received a message on topic '{}': {}\n", topic, payload);
                    self.handle_message(msg).await;
                } else {
                    eprintln!("Lost connection. Attempting reconnect...");
                    while let Err(err) = self.client.reconnect().await {
                        rconn_attempt += 1;
                        eprintln!("Error reconnecting #{}: {}", rconn_attempt, err);
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

        let mut scan_result = ScanResult {
            message: "Error occured!".to_string(),
            success_type: SuceessType::Error,
        };

        let item_mqtt: RefrigeratorItemFromMqtt = match serde_json::from_str(&payload) {
            Ok(item) => item,
            Err(e) => {
                eprintln!("Failed to parse message payload: {:?}", e);
                scan_result.message = "Failed to parse message payload.".to_string();
                publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                return; // EXIT EARLY!!
            }
        };

        let parsed_date = match parse_date(&item_mqtt.expiration_date) {
            Some(date) => date,
            None => {
                eprintln!(
                    "Failed to parse expiration date: {:?}",
                    item_mqtt.expiration_date
                );
                scan_result.message = format!(
                    "Failed to parse expiration date:\n\'{}\'",
                    item_mqtt.expiration_date
                );

                publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                return; // EXIT EARLY!!
            }
        };

        let item = get_refrigerator_item(&self.pool, &item_mqtt.barcode).await;
        match item {
            Some(item) => {
                eprintln!("Item already exists in the database.");
                match update_refrigerator_item(
                    &self.pool,
                    &item_mqtt.barcode,
                    &UpdateRefrigeratorItem {
                        quantity: Some(0),
                        ..Default::default()
                    },
                )
                .await
                {
                    Ok(_) => {
                        scan_result.message = format!("{} updated successfully.", item.name);
                        scan_result.success_type = SuceessType::Info;
                        publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                    }
                    _ => {
                        scan_result.message = format!("Failed to update {}.", item.name);
                        scan_result.success_type = SuceessType::Error;
                        publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                    }
                }

                return; // EXIT EARLY!!
            }
            None => (),
        }

        let item_product = match self.fetch_product(&item_mqtt.barcode).await {
            Some(product) => product,
            None => {
                scan_result.message = "Product not found!".to_string();
                publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                return; // EXIT EARLY!!
            }
        };

        let item = RefrigeratorItem {
            barcode: item_mqtt.barcode,
            expiration_date: parsed_date,
            name: item_product.name,
            quantity: 1,
            weight: match item_product.weight {
                Some(weight) => {
                    Some(weight.to_string() + &item_product.weight_unit.unwrap_or_default())
                }
                None => None,
            },
            nutrition: sqlx::types::Json::from(item_product.nutrition.unwrap_or_default()),
            image_url: match item_product.image {
                Some(image) => Some(image),
                None => None,
            },
            ..Default::default()
        };

        let result = insert_refrigerator_item(&self.pool, &item).await;
        match result {
            Ok(_) => {
                println!("Inserted item from MQTT message successfully.");
                scan_result.message = format!("New item inserted successfully:\n{}", item.name);
                scan_result.success_type = SuceessType::Success;
                publish_json_response(&self.client, TOPIC_SCAN_RESULT, scan_result).await;
                return; // EXIT EARLY!!
            }
            Err(e) => eprintln!("Failed to insert item from MQTT message: {:?}", e),
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
                eprintln!("Product not found.");
                return None;
            }
        };
    }
}
