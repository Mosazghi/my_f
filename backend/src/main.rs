use route::create_router;
use std::env;
use std::sync::Arc;
use std::time::Duration;
use tokio::{task, time};

pub mod db;
pub mod mqtt;
pub mod server;
pub mod util;

use crate::server::*;
use dotenv::dotenv;
use sqlx::{postgres::PgPoolOptions, PgPool};

type Error = Box<dyn std::error::Error>;

pub struct AppState {
    db: PgPool,
}

use expo_push_notification_client::{Expo, ExpoClientOptions, ExpoPushMessage, ExpoPushTicket};

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database: {}", database_url);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    println!("Connected to database");

    sqlx::migrate!("./migrations").run(&pool).await?;

    let (mqtt_client, eventloop) = mqtt::new().await;

    let pool_clone_for_task = pool.clone();
    task::spawn(async move {
        mqtt::start(mqtt_client, eventloop, &pool_clone_for_task).await;
        time::sleep(Duration::from_secs(3)).await
    });

    let app = create_router(Arc::new(AppState { db: pool.clone() }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());

    tokio::spawn(async move {
        let expo = Expo::new(ExpoClientOptions {
            access_token: Some(
                env::var("EXPO_ACCESS_TOKEN").expect("EXPO_ACCESS TOKEN must be set"),
            ),
        });

        let expo_push_token = "ExponentPushToken[fMCrTiIxrbZ4zKrrIevgSn]";

        loop {
            let items = db::get_refrigerator_items(&pool).await.unwrap();
            let one_day_left = items
                .iter()
                .filter(|item| {
                    item.expiration_date
                        .signed_duration_since(chrono::Local::now().naive_local().date())
                        .num_days()
                        == 1
                })
                .collect::<Vec<_>>();

            for (i, item) in one_day_left.iter().enumerate() {
                let expo_push_message = ExpoPushMessage::builder([expo_push_token])
                    .title("Expiry Notification")
                    .body(format!(
                        "{} is expiring in 1 day ({})!!",
                        item.name, item.expiration_date
                    ))
                    .sound("default")
                    .build()
                    .unwrap();
                match expo.send_push_notifications(expo_push_message).await {
                    Ok(tickets) => {
                        for ticket in tickets {
                            match ticket {
                                ExpoPushTicket::Ok(receipt) => {
                                    println!("Notification sent successfully: {:?}", receipt);
                                }
                                ExpoPushTicket::Error(error) => {
                                    eprintln!("Error in push ticket: {:?}", error);
                                }
                            }
                        }
                    }
                    Err(error) => {
                        eprintln!("Failed to send push notification: {:?}", error);
                    }
                }
            }

            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
