use crate::{db::get_refrigerator_items, AppState};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use std::sync::Arc;

use crate::db::models::RefrigeratorItem;

use serde::{Deserialize, Serialize};
#[derive(Debug, Deserialize, Serialize)]
pub struct ResponseError {
    success: bool,
    message: String,
    items: Option<Vec<RefrigeratorItem>>,
}

pub async fn get_items(
    State(data): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<ResponseError>)> {
    let mut response = ResponseError {
        success: false,
        message: "Your refrigerator is empty.".to_string(),
        items: None,
    };

    println!("Getting items from the refrigerator.");

    match get_refrigerator_items(&data.db).await {
        Ok(items) => {
            response = ResponseError {
                success: true,
                message: "Items retrieved successfully.".to_string(),
                items: Some(items),
            };

            Ok((StatusCode::OK, Json(response)))
        }

        Err(_) => Err((StatusCode::NOT_FOUND, Json(response))),
    }
}
