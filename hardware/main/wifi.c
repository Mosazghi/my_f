#include "wifi.h"

#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include "esp_log.h"

#include "esp_event.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include <string.h>

const char *WIFI_TAG = "WIFI";
static void wifi_event_handler(void *event_handler_arg,
                               esp_event_base_t event_base, int32_t event_id,
                               void *event_data) {
  switch (event_id) {
  case WIFI_EVENT_STA_START:
    ESP_LOGI(WIFI_TAG, "WIFI_EVENT_STA_START");
    break;
  case WIFI_EVENT_STA_CONNECTED:
    ESP_LOGI(WIFI_TAG, "WIFI_EVENT_STA_CONNECTED");
    break;
  case WIFI_EVENT_STA_DISCONNECTED:
    ESP_LOGI(WIFI_TAG, "WIFI_EVENT_STA_DISCONNECTED");
    break;
  case IP_EVENT_STA_GOT_IP:
    ESP_LOGI(WIFI_TAG, "IP_EVENT_STA_GOT_IP");
    break;
  default:
    break;
  }
}

void wifi_connection() {
  nvs_flash_init();
  esp_netif_init();
  esp_event_loop_create_default();
  esp_netif_create_default_wifi_sta();
  wifi_init_config_t wifi_initiation = WIFI_INIT_CONFIG_DEFAULT();
  esp_wifi_init(&wifi_initiation);
  esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, wifi_event_handler,
                             NULL);
  esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, wifi_event_handler,
                             NULL);
  wifi_config_t wifi_configuration = {.sta = {.ssid = SSID, .password = PASS}};
  esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_configuration);
  esp_wifi_set_mode(WIFI_MODE_STA);
  esp_wifi_start();
  esp_wifi_connect();
}
