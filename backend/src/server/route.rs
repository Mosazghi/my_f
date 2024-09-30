use std::sync::Arc;

use axum::{
    routing::{get, patch, post},
    Router,
};

use crate::{handlers::*, AppState};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/items", get(get_items))
        .route("/api/items/:id", patch(update_item).delete(delete_item))
        .route("/register-token", post(register_token))
        .with_state(app_state)
}
