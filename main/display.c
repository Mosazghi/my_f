#include "display.h"
#include "core/lv_obj.h"

lv_disp_t *disp;
lv_obj_t *dateLabel;
lv_obj_t *codeLabel;
lv_obj_t *statusLabel;

void display_set_text(lv_obj_t *label, const char *text) {
  if (lvgl_port_lock(0)) {
    lv_label_set_text(label, text);
    lvgl_port_unlock();
  }
}

void display_set_text_fmt(lv_obj_t *label, const char *fmt, ...) {
  if (lvgl_port_lock(0)) {
    va_list args;
    va_start(args, fmt);
    lv_vlabel_set_text_fmt(label, fmt, args);
    va_end(args);
    lvgl_port_unlock();
  }
}
static void lv_vlabel_set_text_fmt(lv_obj_t *label, const char *fmt,
                                   va_list args) {
  char buf[256];
  vsnprintf(buf, sizeof(buf), fmt, args);
  lv_label_set_text(label, buf);
}

void display_init() {
  i2c_init();

  if (lvgl_port_lock(0)) {
    lvgl_init();
    lvgl_port_unlock();
  }
}

static void lvgl_init() {
  lv_obj_t *scr = lv_disp_get_scr_act(disp);
  dateLabel = lv_label_create(scr);
  codeLabel = lv_label_create(scr);
  statusLabel = lv_label_create(scr);

  lv_label_set_long_mode(dateLabel,
                         LV_LABEL_LONG_SCROLL_CIRCULAR); // Circular scroll
  lv_label_set_long_mode(codeLabel, LV_LABEL_LONG_SCROLL_CIRCULAR);
  lv_label_set_long_mode(statusLabel, LV_LABEL_LONG_SCROLL_CIRCULAR);

  display_set_text(codeLabel, "Enter code: ");
  display_set_text(dateLabel, "Waiting for scan...");
  display_set_text(statusLabel, "");

  lv_obj_set_width(dateLabel, disp->driver->hor_res);
  lv_obj_set_width(codeLabel, disp->driver->hor_res);
  lv_obj_set_width(statusLabel, disp->driver->hor_res);

  lv_obj_align(codeLabel, LV_ALIGN_TOP_MID, 0, 0);
  lv_obj_align(dateLabel, LV_ALIGN_BOTTOM_MID, 0, -15);
  lv_obj_align(statusLabel, LV_ALIGN_BOTTOM_MID, 0, 0);
}

static void i2c_init() {
  i2c_master_bus_handle_t i2c_bus = NULL;
  i2c_master_bus_config_t bus_config = {
      .clk_source = I2C_CLK_SRC_DEFAULT,
      .glitch_ignore_cnt = 7,
      .i2c_port = 0,
      .sda_io_num = OLED_PIN_SDA,
      .scl_io_num = OLED_PIN_SCL,
      .flags.enable_internal_pullup = true,
  };
  ESP_ERROR_CHECK(i2c_new_master_bus(&bus_config, &i2c_bus));

  esp_lcd_panel_io_handle_t io_handle = NULL;
  esp_lcd_panel_io_i2c_config_t io_config = {
      .dev_addr = OLED_I2C_ADDR,
      .scl_speed_hz = OLED_CLOCK_HZ,
      .control_phase_bytes = 1,
      .lcd_cmd_bits = OLED_CMD_BITS,
      .lcd_param_bits = OLED_CMD_BITS,
      .dc_bit_offset = 6,
  };

  ESP_ERROR_CHECK(esp_lcd_new_panel_io_i2c(i2c_bus, &io_config, &io_handle));

  esp_lcd_panel_handle_t panel_handle = NULL;
  esp_lcd_panel_dev_config_t panel_config = {
      .bits_per_pixel = 1,
      .reset_gpio_num = OLED_PIN_RST,
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
                                            .buffer_size =
                                                OLED_H_RES * OLED_V_RES,
                                            .double_buffer = true,
                                            .hres = OLED_H_RES,
                                            .vres = OLED_V_RES,
                                            .monochrome = true,
                                            .rotation = {
                                                .swap_xy = false,
                                                .mirror_x = false,
                                                .mirror_y = false,
                                            }};
  disp = lvgl_port_add_disp(&disp_cfg);

  lv_disp_set_rotation(disp, LV_DISP_ROT_180);
}
