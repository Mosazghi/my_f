#include <stdio.h>

#include "display.h"
#include "joystick.h"
#include "mqtt.h"
#include "scan.h"
#include "wifi.h"

static void init();
static void init_i2c();
static void display_to_oled_task();
QueueHandle_t queue;
void app_main(void) {
  queue = xQueueCreate(10, sizeof(scan_data_t));

  init();
  mqtt_subscribe("newScan");
  mqtt_subscribe("scanResult");
}

static void init() {
  wifi_connection();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  mqtt_app_start();
  scan_init();
  display_init();

  xTaskCreate(joystick_task, "joystick_task", 2300, NULL, 10, NULL);
}
