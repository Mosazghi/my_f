#ifndef JOYSTICK_H
#define JOYSTICK_H

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include <stdint.h>

#define VRX_PIN ADC1_GPIO32_CHANNEL
#define VRY_PIN ADC1_GPIO33_CHANNEL
#define SW_PIN 15

#define LEFT_THRESHOLD 1000
#define RIGHT_THRESHOLD 3000
#define UP_THRESHOLD 1000
#define DOWN_THRESHOLD 3000

extern QueueHandle_t date_queue;

typedef enum {
  COMMAND_NONE = 0X00,
  COMMAND_LEFT = 0X01,
  COMMAND_RIGHT = 0X02,
  COMMAND_UP = 0X04,
  COMMAND_DOWN = 0X08,
} command_t;

typedef struct {
  uint8_t month;
  uint8_t day;
  uint16_t year;
} exp_date_t;

typedef enum { EDIT_DAY, EDIT_MONTH, EDIT_YEAR } edit_state_t;

void joystick_task(void *args);
#endif // JOYSTICK_H
