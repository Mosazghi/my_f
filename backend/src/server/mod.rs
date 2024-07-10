// #![allow(dead_code)]
// use crate::db::operations::get_refrigerator_items;
// use crate::db::RefrigeratorItem;
// use axum::{routing::get, Json, Router};
// use serde::{Deserialize, Serialize};
// use sqlx::PgPool;
// use std::net::SocketAddr;
//
// #[derive(Deserialize, Serialize, Debug)]
// pub struct Greet {
//     greet: String,
//     name: String,
// }
//
// pub struct Server {
//     addr: SocketAddr,
//     pool: PgPool,
// }
//
// impl Server {
//     pub fn new(pool: PgPool, addr: SocketAddr) -> Self {
//         Server { addr, pool }
//     }
//
//     pub fn router(&self) -> Router {
//         Router::new().route("/items", get(self.get_items))
//     }
//
//     pub async fn start(&self) {
//         let app = self.router();
//
//         let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
//
//         println!("Listening on: http://{}", listener.local_addr().unwrap());
//
//         axum::serve(listener, app).await.unwrap_or_else(|e| {
//             println!("Error starting the server: {:?}", e);
//             std::process::exit(1);
//         })
//     }
//
//     pub async fn get_items(&self) -> Result<Json<Vec<RefrigeratorItem>>, sqlx::Error> {
//         let items = get_refrigerator_items(self.pool).await.unwrap();
//
//         match items.len() {
//             0 => Err(sqlx::Error::RowNotFound),
//             _ => Ok(Json(items)),
//         }
//     }
// }
//
pub mod handlers;
pub mod route;
