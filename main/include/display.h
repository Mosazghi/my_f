#pragma once

// disp
#include "driver/i2c_master.h"
#include "esp_err.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_panel_vendor.h"
#include "esp_log.h"
#include "esp_lvgl_port.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "lvgl.h"
#include <stdio.h>

#define OLED_CLOCK_HZ (400 * 1000)
#define OLED_PIN_SDA GPIO_NUM_21
#define OLED_PIN_SCL GPIO_NUM_22
#define OLED_PIN_RST -1
#define OLED_I2C_ADDR 0x3C

#define OLED_H_RES 128
#define OLED_V_RES 64

#define OLED_CMD_BITS 8
#define OLED_PARAM_BITS 8
#define LOL 2

void display_init();
void display_set_text(lv_obj_t *label, const char *text);
void display_set_text_fmt(lv_obj_t *label, const char *fmt, ...);

extern lv_obj_t *dateLabel;
extern lv_obj_t *codeLabel;
extern lv_obj_t *statusLabel;

static void lvgl_init();
static void i2c_init();
static void lv_vlabel_set_text_fmt(lv_obj_t *label, const char *fmt,
                                   va_list args);
