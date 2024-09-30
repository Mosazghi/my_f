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

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
