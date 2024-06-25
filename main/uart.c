#include "uart.h"
#include "esp_log.h"
#include "mqtt.h"
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

  uint8_t *data = (uint8_t *)malloc(BUF_SIZE);

  while (1) {
    UBaseType_t uxHighWaterMark;
    uxHighWaterMark = uxTaskGetStackHighWaterMark(NULL);
    printf("uart: %u\n", uxHighWaterMark);
    // Read data from the UART
    int len = uart_read_bytes(PORT_NUM, data, (BUF_SIZE - 1),
                              20 / portTICK_PERIOD_MS);
    if (len) {
      data[len] = '\0';
      ESP_LOGI(UART_TAG, "Read: %s", (char *)data);
      mqtt_publish("test", (char *)data);
    }
    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void uart_init(void) {
  xTaskCreate(echo_task, "uart_echo_task", 1768, NULL, 10, NULL);
}
