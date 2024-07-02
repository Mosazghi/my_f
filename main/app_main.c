#include "core/lv_obj.h"
#include "esp_event.h"
#include <stdio.h>

#include "display.h"
#include "joystick.h"
#include "mqtt.h"
#include "scan.h"
#include "wifi.h"

static void init();
static void init_i2c();
static void display_to_oled_task();

void app_main(void) {
  init();

  mqtt_subscribe("newScan");
}

static void init() {
  scan_context_t context = {0};
  wifi_connection();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  mqtt_app_start();
  scan_init(&context);
  display_init();

  xTaskCreate(joystick_task, "joystick_task", 2048, &context, 10, NULL);
}
