use std::sync::Arc;

use axum::{routing::get, Router};

use crate::{handlers::get_items, AppState};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/items", get(get_items))
        .with_state(app_state)
}
