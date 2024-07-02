#ifndef UART_H
#define UART_H

#include "driver/uart.h"
#include "freertos/task.h"
#include <stdint.h>

#define TX_PIN (17)
#define RX_PIN (16)
#define RTS (UART_PIN_NO_CHANGE)
#define CTS (UART_PIN_NO_CHANGE)

#define PORT_NUM (UART_NUM_1)
#define BAUD_RATE (9600)

#define BUF_SIZE (256)
static void scan_task(void *arg);

typedef struct {
  uint8_t code[BUF_SIZE];
  bool hasScanned;
  SemaphoreHandle_t scanSemaphore;
} scan_context_t;

void scan_init(scan_context_t *context);
#endif
