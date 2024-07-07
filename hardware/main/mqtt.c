#include "mqtt.h"

#include "display.h"
#include "esp_log.h"
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
extern lv_obj_t *statusLabel;
const char *MQTT_TAG = "MQTT_TCP";
bool mqtt_connected = false;
static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event) {
  // esp_mqtt_client_handle_t _client = event->_client;

  switch (event->event_id) {
  case MQTT_EVENT_CONNECTED:
    ESP_LOGI(MQTT_TAG, "MQTT_EVENT_CONNECTED");
    mqtt_connected = true;
    break;
  case MQTT_EVENT_DISCONNECTED:
    break;
  case MQTT_EVENT_SUBSCRIBED:
    ESP_LOGI(MQTT_TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);

    break;
  case MQTT_EVENT_UNSUBSCRIBED:
    ESP_LOGI(MQTT_TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
    break;
  case MQTT_EVENT_PUBLISHED:
    ESP_LOGI(MQTT_TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
    break;
  case MQTT_EVENT_DATA:
    ESP_LOGI(MQTT_TAG, "MQTT_EVENT_DATA");
    printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
    printf("DATA=%.*s\r\n", event->data_len, event->data);
    if (strcmp(event->topic, "scanResult") == 0) {
      printf("Data: %s\n", (char *)event->data);
      // display_set_text_fmt(statusLabel, (char *)event->data);
    }

    break;
  case MQTT_EVENT_ERROR:
    ESP_LOGE(MQTT_TAG, "MQTT_EVENT_ERROR");
    break;
  default:
    ESP_LOGI(MQTT_TAG, "Other event id:%d", event->event_id);
    break;
  }
  return ESP_OK;
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base,
                               int32_t event_id, void *event_data)

{
  ESP_LOGD(MQTT_TAG, "Event dispatched from event loop base=%s, event_id=%i",
           base, (int)event_id);
  mqtt_event_handler_cb(event_data);
}
void mqtt_app_start() {
  esp_mqtt_client_config_t mqtt_cfg = {
      .broker.address.uri = MQTT_URI,
  };

  _client = esp_mqtt_client_init(&mqtt_cfg);
  esp_mqtt_client_register_event(_client, ESP_EVENT_ANY_ID, mqtt_event_handler,
                                 _client);
  esp_mqtt_client_start(_client);
}

void mqtt_subscribe(const char *topic) {
  if (mqtt_connected)
    esp_mqtt_client_subscribe(_client, topic, 0);
  else
    while (!mqtt_connected) {
      vTaskDelay(1500 / portTICK_PERIOD_MS);
      printf("CLient is not connected. Resubscribing...\n");
      esp_mqtt_client_subscribe(_client, topic, 0);
    }
}

int mqtt_publish(const char *topic, const char *data) {
  if (mqtt_connected)
    return esp_mqtt_client_publish(_client, topic, data, 0, 0, 0);
  else
    while (!mqtt_connected)
      esp_mqtt_client_reconnect(_client);

  return -1;
}
