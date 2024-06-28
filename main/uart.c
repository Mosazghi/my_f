#include "uart.h"
#include "esp_log.h"
#include "mqtt.h"
#include <cJSON.h>
#include <stdio.h>

static const char *UART_TAG = "UART";

static void echo_task(void *arg) {
  uart_config_t uart_config = {
      .baud_rate = BUAD_RATE,
      .data_bits = UART_DATA_8_BITS,
      .parity = UART_PARITY_DISABLE,
      .stop_bits = UART_STOP_BITS_1,
      .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
      .source_clk = UART_SCLK_DEFAULT,
  };

  ESP_ERROR_CHECK(uart_driver_install(PORT_NUM, BUF_SIZE * 2, 0, 0, NULL, 0));
  ESP_ERROR_CHECK(uart_param_config(PORT_NUM, &uart_config));
  ESP_ERROR_CHECK(uart_set_pin(PORT_NUM, TX_PIN, RX_PIN, RTS, CTS));

  uint8_t *code = (uint8_t *)malloc(BUF_SIZE);
  const char *date = "2021-10-10";

  while (1) {
    // Read code from the UART
    int len = uart_read_bytes(PORT_NUM, code, (BUF_SIZE - 1),
                              20 / portTICK_PERIOD_MS);
    cJSON *data = cJSON_CreateObject();

    if (len) {
      code[len] = '\0';
      code[len - 1] = '\0';
      ESP_LOGI(UART_TAG, "Read: %s", (char *)code);
      cJSON_AddStringToObject(data, "code", (char *)code);
      cJSON_AddStringToObject(data, "expdate", date);
      char *json = cJSON_Print(data);
      ESP_LOGI(UART_TAG, "JSON: %s", json);
      mqtt_publish("newScan", json);

      cJSON_free(json);
    }
    cJSON_Delete(data);
    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void uart_init(void) {
  xTaskCreate(echo_task, "uart_echo_task", 2048, NULL, 10, NULL);
}
