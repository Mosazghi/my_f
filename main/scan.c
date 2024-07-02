#include "scan.h"
#include "display.h"
#include "esp_log.h"
#include "esp_lvgl_port.h"
#include "font/lv_symbol_def.h"
#include "freertos/semphr.h"
#include "lvgl.h"
#include <stdio.h>

// static const char *UART_TAG = "UART";

static void scan_task(void *arg) {
  scan_context_t *context = (scan_context_t *)arg;

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

  while (1) {
    int len = uart_read_bytes(PORT_NUM, context->code, (BUF_SIZE - 1),
                              20 / portTICK_PERIOD_MS);

    if (len) {
      context->code[len] = '\0';
      context->code[len - 1] = '\0';

      if (!context->hasScanned) {
        context->hasScanned = true;
        xSemaphoreGive(context->scanSemaphore);
      }

      display_set_text_fmt(codeLabel, "CODE: %s", (char *)context->code);
    }
    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void scan_init(scan_context_t *context) {
  context->scanSemaphore = xSemaphoreCreateBinary();
  xTaskCreate(scan_task, "scan_task", 1024 * 2, context, 10, NULL);
}
