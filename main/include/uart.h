#ifndef UART_H
#define UART_H

#include "driver/uart.h"
#include "freertos/task.h"
#define TX_PIN (17)
#define RX_PIN (16)
#define RTS (UART_PIN_NO_CHANGE)
#define CTS (UART_PIN_NO_CHANGE)

#define PORT_NUM (UART_NUM_1)
#define BUAD_RATE (9600)

#define BUF_SIZE (256)

static void echo_task(void *arg);

void uart_init(void);
#endif
