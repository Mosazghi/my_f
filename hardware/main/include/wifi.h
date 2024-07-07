#pragma once
#define SSID "Home_Net-55980D"
#define PASS "runBehomVit4"

#include "esp_log.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include "nvs_flash.h"
#include <stdio.h>

static void wifi_event_handler(void *event_handler_arg,

                               esp_event_base_t event_base, int32_t event_id,
                               void *event_data);

void wifi_connection();
