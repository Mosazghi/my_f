use crate::db::{models::RefrigeratorItem, operations::insert_refrigerator_item};
pub mod types;
use futures::stream::StreamExt;
use paho_mqtt as mqtt;
use reqwest::{Error, Response};
use serde::Deserialize;
use sqlx::PgPool;
use std::env;
use std::{process, time::Duration};
pub use types::{ApiResponse, ApiResponseData, Product, RefrigeratorItemFromMqtt};

const TOPIC: &str = "newScan";
const QOS: i32 = 1;

pub struct MqttClient {
    pool: PgPool,
    client: mqtt::AsyncClient,
}

impl MqttClient {
    pub async fn new(pool: PgPool) -> Self {
        let host = "mqtt://10.161.2.5:1883";

        println!("Connecting to the MQTT broker at {}", host);

        let create_opts = mqtt::CreateOptionsBuilder::new_v3()
            .server_uri(host)
            .client_id("rust_async_subscribe")
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

            println!("Subscribing to topics: {:?}", TOPIC);
            self.client.subscribe(TOPIC, QOS).await?;

            println!("Waiting for messages...");

            let mut rconn_attempt: usize = 0;

            while let Some(msg_opt) = strm.next().await {
                if let Some(msg) = msg_opt {
                    let topic = msg.topic();
                    let payload = msg.payload_str();
                    println!("Received a message on topic '{}': {}", topic, payload);
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
                    barcode: 0,
                    expiration_date: "".to_string(),
                }
            });

        println!("Parsed message: {:?}", item_mqtt);

        // Insert the item into the database (uncomment the code below when the insert_refrigerator_item function is ready)
        // let result = insert_refrigerator_item(&self.pool, item_mqtt).await;
        // match result {
        //     Ok(_) => println!("Inserted item from MQTT message successfully."),
        //     Err(e) => println!("Failed to insert item from MQTT message: {:?}", e),
        // }
    }

    async fn fetch_product(&self, ean: &str) -> Result<Option<Product>, Error> {
        let url = format!("https://kassal.app/api/v1/products/ean/{}", ean);
        let client = reqwest::Client::new();
        let bearer_token = env::var("BEARER_TOKEN").unwrap_or_default();
        let response = client
            .get(&url)
            .bearer_auth(bearer_token)
            .send()
            .await?
            .json::<ApiResponse>()
            .await?;

        let valid_product = response
            .data
            .products
            .into_iter()
            .find(|product| product.weight.is_some());

        Ok(valid_product)
    }
}
