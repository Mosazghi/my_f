use paho_mqtt::{self as mqtt};

pub fn parse_date(date: &str) -> chrono::NaiveDate {
    chrono::NaiveDate::parse_from_str(date, "%d/%m/%Y").unwrap_or_else(|e| {
        println!("Failed to parse date: {:?}", e);
        chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()
    })
}

pub async fn publish_json_response<T: serde::Serialize>(
    client: &mqtt::AsyncClient,
    topic: &str,
    response: T,
) {
    let response = serde_json::to_string(&response).unwrap();
    let msg = mqtt::Message::new(topic, response, mqtt::QOS_1);
    if let Err(e) = client.publish(msg).await {
        println!("Failed to publish message: {:?}", e);
    }
}
