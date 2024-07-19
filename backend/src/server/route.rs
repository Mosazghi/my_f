use std::sync::Arc;

use axum::{
    routing::{get, patch},
    Router,
};

use crate::{handlers::*, AppState};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/items", get(get_items))
        .route("/api/items/:id", patch(update_item).delete(delete_item))
        .with_state(app_state)
}
