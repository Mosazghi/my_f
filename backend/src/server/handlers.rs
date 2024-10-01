use crate::{
    db::{
        delete_refrigerator_item, get_refrigerator_items, insert_token, models::RefrigeratorItem,
        update_refrigerator_item,
    },
    AppState,
};
use axum::extract::{Path, State};
use axum::{extract::Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize)]
pub struct TokenData {
    pub token: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Response {
    success: bool,
    message: String,
    items: Option<Vec<RefrigeratorItem>>,
}

pub async fn register_token(
    State(data): State<Arc<AppState>>,
    Json(payload): Json<TokenData>,
) -> Result<impl IntoResponse, (StatusCode, Json<Response>)> {
    let mut response = Response {
        success: false,
        message: "Failed to insert push token".to_string(),
        items: None,
    };
    match insert_token(&payload, &data.db).await {
        Ok(_) => {
            response = Response {
                success: true,
                message: "Push token inserted successfully".to_string(),
                items: None,
            };
            Ok((StatusCode::OK, Json(response)))
        }

        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(response))),
    }
}

pub async fn get_items(
    State(data): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<Response>)> {
    let mut response = Response {
        success: false,
        message: "Your refrigerator is empty.".to_string(),
        items: None,
    };

    println!("Getting items from the refrigerator.");

    match get_refrigerator_items(&data.db).await {
        Ok(items) => {
            response = Response {
                success: true,
                message: "Items retrieved successfully.".to_string(),
                items: Some(items),
            };

            Ok((StatusCode::OK, Json(response)))
        }

        Err(_) => Err((StatusCode::NOT_FOUND, Json(response))),
    }
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateRefrigeratorItem {
    pub name: Option<String>,
    pub quantity: Option<i32>,
    pub expiration_date: Option<String>,
    pub weight: Option<String>,
}

pub async fn update_item(
    Path(barcode): Path<String>,
    State(data): State<Arc<AppState>>,
    Json(input): Json<UpdateRefrigeratorItem>,
) -> Result<impl IntoResponse, (StatusCode, Json<Response>)> {
    println!("Updating item with barcode: {}", barcode);
    match update_refrigerator_item(&data.db, &barcode, &UpdateRefrigeratorItem { ..input }).await {
        Ok(_) => {
            println!("Item updated successfully.");

            Ok((
                StatusCode::OK,
                Json(Response {
                    success: true,
                    message: "Item updated successfully.".to_string(),
                    items: None,
                }),
            ))
        }
        Err(_) => {
            println!("Failed to update item.");

            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Response {
                    success: false,
                    message: "Failed to update item.".to_string(),
                    items: None,
                }),
            ))
        }
    }
}

pub async fn delete_item(
    Path(barcode): Path<String>,
    State(data): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<Response>)> {
    println!("Deleting item with barcode: {}", barcode);
    match delete_refrigerator_item(&data.db, &barcode).await {
        Ok(_) => Ok((
            StatusCode::OK,
            Json(Response {
                success: true,
                message: "Item deleted successfully.".to_string(),
                items: None,
            }),
        )),

        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(Response {
                success: false,
                message: "Failed to delete item.".to_string(),
                items: None,
            }),
        )),
    }
}
