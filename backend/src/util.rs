use rumqttc::QoS;

pub fn parse_date(date: &str) -> Option<chrono::NaiveDate> {
    if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date, "%d/%m/%Y") {
        return Some(parsed_date);
    } else {
        return None;
    }
}

pub async fn publish_json_response<T: serde::Serialize>(
    client: &rumqttc::AsyncClient,
    topic: &str,
    response: T,
) {
    let response = serde_json::to_string(&response).unwrap();
    if let Err(e) = client
        .publish(topic, QoS::ExactlyOnce, false, response)
        .await
    {
        println!("Failed to publish message: {:?}", e);
    }
}
