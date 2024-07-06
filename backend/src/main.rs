use dotenv::dotenv;
use std::env;

pub mod db;
pub mod mqtt;
pub mod server;

use server::Server;
use std::net::SocketAddr;

use sqlx::postgres::PgPoolOptions;
use tokio::task;

type Error = Box<dyn std::error::Error>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

    let mut mqtt_client = mqtt::MqttClient::new(pool).await;

    let mqtt_handle = task::spawn(async move {
        mqtt_client.start().await;
    });

    let server = Server::new(addr);
    let server_handle = task::spawn(async move {
        server.start().await;
    });

    tokio::try_join!(mqtt_handle, server_handle)?;

    Ok(())
}
