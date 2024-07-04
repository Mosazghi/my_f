use axum::{
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Deserialize, Serialize, Debug)]
pub struct Greet {
    greet: String,
    name: String,
}

pub struct Server {
    addr: SocketAddr,
}

impl Server {
    pub fn new(addr: SocketAddr) -> Self {
        Server { addr }
    }

    pub fn router() -> Router {
        Router::new()
            .route("/hello", get(Self::hello))
            .route("/", get(Self::not_found))
            .route("/greet", get(Self::greet))
            .route("/greetme", post(Self::greetme))
    }

    pub async fn start(&self) {
        let app = Self::router();

        let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

        println!("Listening on: http://{}", listener.local_addr().unwrap());

        axum::serve(listener, app).await.unwrap_or_else(|e| {
            println!("Error starting the server: {:?}", e);
            std::process::exit(1);
        })
    }

    pub async fn hello() -> (StatusCode, &'static str) {
        (StatusCode::OK, "Hello, World!")
    }

    pub async fn not_found() -> (StatusCode, &'static str) {
        (StatusCode::NOT_FOUND, "404 page not found.")
    }

    pub async fn greet() -> (StatusCode, Json<Greet>) {
        println!("[GET]");

        (
            StatusCode::OK,
            Json(Greet {
                greet: "Hello".to_string(),
                name: "Mariusz".to_string(),
            }),
        )
    }

    pub async fn greetme(
        payload: Option<Json<Greet>>,
    ) -> (StatusCode, Result<Json<Greet>, String>) {
        match payload {
            Some(greet) => {
                println!("[POST] {:#?}", greet);
                (StatusCode::OK, Ok(greet))
            }
            None => {
                let err = Err("Incorrect payload".to_string());
                println!("[FAILED POST] {:#?}", err);
                (StatusCode::BAD_REQUEST, err)
            }
        }
    }
}
