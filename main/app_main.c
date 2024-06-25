#include "esp_event.h"
#include <stdio.h>

#include "mqtt.h"
#include "uart.h"
#include "wifi.h"

static void init() {
  uart_init();
  wifi_connection();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  printf("WIFI was initiated ...........\n");

  mqtt_app_start();
}
void app_main(void) {
  init();

  mqtt_subscribe("test");
}
