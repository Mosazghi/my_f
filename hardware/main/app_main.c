#include <stdio.h>

#include "display.h"
#include "joystick.h"
#include "mqtt.h"
#include "scan.h"
#include "wifi.h"

static void init();

QueueHandle_t queue;

void app_main(void) {
  init();
  mqtt_subscribe("scan/result");
}

static void init() {
  queue = xQueueCreate(10, sizeof(scan_data_t));

  wifi_connection();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  mqtt_app_start();
  scan_init();
  display_init();

  xTaskCreate(joystick_task, "joystick_task", 2300, NULL, 10, NULL);
}
