#include "core/lv_obj.h"
#include "esp_event.h"
#include <stdio.h>

#include "joystick.h"
#include "mqtt.h"
#include "uart.h"
#include "wifi.h"

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

#define EXAMPLE_LCD_PIXEL_CLOCK_HZ (400 * 1000)
#define EXAMPLE_PIN_NUM_SDA GPIO_NUM_21
#define EXAMPLE_PIN_NUM_SCL GPIO_NUM_22
#define EXAMPLE_PIN_NUM_RST -1
#define EXAMPLE_I2C_HW_ADDR 0x3C

#define EXAMPLE_LCD_H_RES 128
#define EXAMPLE_LCD_V_RES 64

#define EXAMPLE_LCD_CMD_BITS 8
#define EXAMPLE_LCD_PARAM_BITS 8

extern void example_lvgl_demo_ui(lv_disp_t *disp);

static void init();
static void init_i2c();
static void display_to_oled_task();

lv_disp_t *disp;
lv_obj_t *label;
void app_main(void) {
  init();
  exp_date_t received_date;

  while (1) {
    // Wait indefinitely for a date to be sent to the queue
    if (xQueueReceive(date_queue, &received_date, portMAX_DELAY) == pdPASS) {
      // Process the received date
      printf("Received Date: %d/%d/%d\n", received_date.day,
             received_date.month, received_date.year);

      if (lvgl_port_lock(0)) {
        lv_label_set_text(label, "");
        lv_label_set_text_fmt(label, "%d/%d/%d", received_date.day,
                              received_date.month, received_date.year);
        lvgl_port_unlock();
      }
    }
  }

  mqtt_subscribe("newScan");
}

static void display_to_oled_task() {
  lv_obj_t *scr = lv_disp_get_scr_act(disp);
  label = lv_label_create(scr);
  lv_label_set_long_mode(label,
                         LV_LABEL_LONG_SCROLL_CIRCULAR); // Circular scroll
  lv_label_set_text(label, "Waiting for date...");
  lv_obj_set_width(label, disp->driver->hor_res);
  lv_obj_align(label, LV_ALIGN_TOP_MID, 10, 30);
}

static void init_i2c() {
  i2c_master_bus_handle_t i2c_bus = NULL;
  i2c_master_bus_config_t bus_config = {
      .clk_source = I2C_CLK_SRC_DEFAULT,
      .glitch_ignore_cnt = 7,
      .i2c_port = 0,
      .sda_io_num = EXAMPLE_PIN_NUM_SDA,
      .scl_io_num = EXAMPLE_PIN_NUM_SCL,
      .flags.enable_internal_pullup = true,
  };
  ESP_ERROR_CHECK(i2c_new_master_bus(&bus_config, &i2c_bus));

  esp_lcd_panel_io_handle_t io_handle = NULL;
  esp_lcd_panel_io_i2c_config_t io_config = {
      .dev_addr = EXAMPLE_I2C_HW_ADDR,
      .scl_speed_hz = EXAMPLE_LCD_PIXEL_CLOCK_HZ,
      .control_phase_bytes = 1,
      .lcd_cmd_bits = EXAMPLE_LCD_CMD_BITS,
      .lcd_param_bits = EXAMPLE_LCD_CMD_BITS,
      .dc_bit_offset = 6,
  };

  ESP_ERROR_CHECK(esp_lcd_new_panel_io_i2c(i2c_bus, &io_config, &io_handle));

  esp_lcd_panel_handle_t panel_handle = NULL;
  esp_lcd_panel_dev_config_t panel_config = {
      .bits_per_pixel = 1,
      .reset_gpio_num = EXAMPLE_PIN_NUM_RST,
  };

  ESP_ERROR_CHECK(
      esp_lcd_new_panel_ssd1306(io_handle, &panel_config, &panel_handle));

  ESP_ERROR_CHECK(esp_lcd_panel_reset(panel_handle));
  ESP_ERROR_CHECK(esp_lcd_panel_init(panel_handle));
  ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(panel_handle, true));

  const lvgl_port_cfg_t lvgl_cfg = ESP_LVGL_PORT_INIT_CONFIG();
  lvgl_port_init(&lvgl_cfg);

  const lvgl_port_display_cfg_t disp_cfg = {.io_handle = io_handle,
                                            .panel_handle = panel_handle,
                                            .buffer_size = EXAMPLE_LCD_H_RES *
                                                           EXAMPLE_LCD_V_RES,
                                            .double_buffer = true,
                                            .hres = EXAMPLE_LCD_H_RES,
                                            .vres = EXAMPLE_LCD_V_RES,
                                            .monochrome = true,
                                            .rotation = {
                                                .swap_xy = false,
                                                .mirror_x = false,
                                                .mirror_y = false,
                                            }};
  disp = lvgl_port_add_disp(&disp_cfg); // Store the display handle

  lv_disp_set_rotation(disp, LV_DISP_ROT_180);
}

static void init() {
  uart_init();
  init_i2c();

  if (lvgl_port_lock(0)) {
    display_to_oled_task();
    lvgl_port_unlock();
  }

  wifi_connection();
  vTaskDelay(2000 / portTICK_PERIOD_MS);

  mqtt_app_start();

  xTaskCreate(joystick_task, "joystick_task", 1024 * 2, NULL, 10, NULL);
}
