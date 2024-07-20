#include "scan.h"
#include "display.h"
#include "esp_log.h"
#include "esp_lvgl_port.h"
#include "font/lv_symbol_def.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "lvgl.h"
#include <stdio.h>

extern QueueHandle_t queue;

static void scan_task(void *arg) {

  uart_config_t uart_config = {
      .baud_rate = BAUD_RATE,
      .data_bits = UART_DATA_8_BITS,
      .parity = UART_PARITY_DISABLE,
      .stop_bits = UART_STOP_BITS_1,
      .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
      .source_clk = UART_SCLK_DEFAULT,
  };

  ESP_ERROR_CHECK(uart_driver_install(PORT_NUM, BUF_SIZE * 2, 0, 0, NULL, 0));
  ESP_ERROR_CHECK(uart_param_config(PORT_NUM, &uart_config));
  ESP_ERROR_CHECK(uart_set_pin(PORT_NUM, TX_PIN, RX_PIN, RTS, CTS));

  scan_data_t scan_data;

  while (1) {
    int len = uart_read_bytes(PORT_NUM, scan_data.code, (BUF_SIZE - 1),
                              20 / portTICK_PERIOD_MS);

    scan_data.hasScanned = (len > 0);

    if (scan_data.hasScanned) {
      scan_data.code[len] = scan_data.code[len - 1] = '\0';
      display_set_text_fmt(codeLabel, "CODE: %s", (char *)scan_data.code);

      if (queue != NULL) {
        xQueueSend(queue, &scan_data, portMAX_DELAY);
      }
    }

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void scan_init() { xTaskCreate(scan_task, "scan_task", 2200, NULL, 10, NULL); }
