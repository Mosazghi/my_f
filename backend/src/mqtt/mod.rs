use crate::db::operations::{get_refrigerator_item, update_refrigerator_item};
use crate::db::{models::RefrigeratorItem, operations::insert_refrigerator_item};
use crate::server::handlers::UpdateRefrigeratorItem;
use crate::util::parse_date;
use crate::util::publish_json_response;

use rumqttc::{AsyncClient, MqttOptions, QoS};
use serde::Serialize;
use sqlx::PgPool;
use std::env;
use std::time::Duration;
use types::{ApiResponse, Product, RefrigeratorItemFromMqtt};

pub mod types;

const TOPIC_NEW_SCAN: &str = "scan/new";
const TOPIC_SCAN_RESULT: &str = "scan/result";

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

pub async fn new() -> (AsyncClient, rumqttc::EventLoop) {
    let mut mqttoptions = MqttOptions::new("backend", "localhost", 1883);

    mqttoptions.set_keep_alive(Duration::from_secs(5));

    let (client, eventloop) = AsyncClient::new(mqttoptions, 10);

    (client, eventloop)
}

pub async fn start(client: AsyncClient, mut eventloop: rumqttc::EventLoop, pool: &PgPool) {
    println!("Starting MQTT client...");
    match client.subscribe(TOPIC_NEW_SCAN, QoS::ExactlyOnce).await {
        Ok(_) => (),
        Err(err) => {
            eprintln!("Failed to subscribe to topics: {:?}", err);
            // process::exit(1);
        }
    }

    println!("Subscribed to topics: {:?}", TOPIC_NEW_SCAN);

    loop {
        let event = eventloop.poll().await;
        match &event {
            Ok(event) => {
                if let rumqttc::Event::Incoming(rumqttc::Incoming::Publish(p)) = event {
                    let payload = std::str::from_utf8(&p.payload).unwrap();
                    handle_message(&client, &pool, payload.to_string()).await;
                }
            }
            Err(_) => {
                while let Err(err) = eventloop.poll().await {
                    eprintln!("Error in eventloop:\n {err:?} \n Trying to reconnect...");
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
                println!("Reconnected to the broker.");
            }
        }
    }
}

pub async fn handle_message(client: &AsyncClient, pool: &PgPool, msg: String) {
    let payload = msg;

    let mut scan_result = ScanResult {
        message: "Error occured!".to_string(),
        success_type: SuceessType::Error,
    };

    let item_mqtt: RefrigeratorItemFromMqtt = match serde_json::from_str(&payload) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to parse message payload: {:?}", e);
            scan_result.message = "Failed to parse message payload.".to_string();
            publish_json_response(&client, TOPIC_SCAN_RESULT, scan_result).await;
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

            publish_json_response(&client, TOPIC_SCAN_RESULT, scan_result).await;
            return; // EXIT EARLY!!
        }
    };

    let item = get_refrigerator_item(pool, &item_mqtt.barcode).await;
    match item {
        Some(item) => {
            eprintln!("Item already exists in the database.");
            match update_refrigerator_item(
                pool,
                &item_mqtt.barcode,
                &UpdateRefrigeratorItem {
                    quantity: Some(item.quantity + 1),
                    ..Default::default()
                },
            )
            .await
            {
                Ok(_) => {
                    scan_result.message = format!("{} updated successfully.", item.name);
                    scan_result.success_type = SuceessType::Info;
                    publish_json_response(client, TOPIC_SCAN_RESULT, scan_result).await;
                }
                _ => {
                    scan_result.message = format!("Failed to update {}.", item.name);
                    scan_result.success_type = SuceessType::Error;
                    publish_json_response(client, TOPIC_SCAN_RESULT, scan_result).await;
                }
            }

            return; // EXIT EARLY!!
        }
        None => (),
    }

    let item_product = match fetch_product(&item_mqtt.barcode).await {
        Some(product) => product,
        None => {
            scan_result.message = "Product not found!".to_string();
            publish_json_response(client, TOPIC_SCAN_RESULT, scan_result).await;
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

    let result = insert_refrigerator_item(pool, &item).await;
    match result {
        Ok(_) => {
            println!("Inserted item from MQTT message successfully.");
            scan_result.message = format!("New item inserted successfully:\n{}", item.name);
            scan_result.success_type = SuceessType::Success;
            publish_json_response(client, TOPIC_SCAN_RESULT, scan_result).await;
            return; // EXIT EARLY!!
        }
        Err(e) => eprintln!("Failed to insert item from MQTT message: {:?}", e),
    }
}

async fn fetch_product(ean: &str) -> Option<Product> {
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
