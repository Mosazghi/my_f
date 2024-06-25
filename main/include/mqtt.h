#ifndef MQTT_H
#define MQTT_H

#include "esp_event_base.h"
#include "mqtt_client.h"

#define MQTT_URI "mqtt://192.168.1.168:1883"

static esp_mqtt_client_handle_t _client;

static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event);

static void mqtt_event_handler(void *handler_args, esp_event_base_t base,
                               int32_t event_id, void *event_data);

void mqtt_app_start();

void mqtt_subscribe(const char *topic);
void mqtt_publish(const char *topic, const char *data);
#endif
