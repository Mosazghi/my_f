use route::create_router;
use std::env;

pub mod db;
pub mod mqtt;
pub mod server;
pub mod util;

use crate::server::*;

use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::task;

use std::sync::Arc;

use dotenv::dotenv;

type Error = Box<dyn std::error::Error>;

pub struct AppState {
    db: PgPool,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let mut mqtt_client = mqtt::MqttClient::new(pool.clone()).await;

    task::spawn(async move {
        mqtt_client.start().await;
    });

    let app = create_router(Arc::new(AppState { db: pool.clone() }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
