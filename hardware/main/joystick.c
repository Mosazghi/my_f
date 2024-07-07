#include "joystick.h"
#include "cJSON.h"
#include "display.h"
#include "driver/gpio.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "esp_lvgl_port.h"
#include "font/lv_symbol_def.h"
#include "freertos/task.h"
#include "mqtt.h"
#include "scan.h"
#include "util.h"
#include "widgets/lv_label.h"

const char *JOYSTICK_TAG = "joystick";
extern QueueHandle_t queue;

void joystick_task(void *args) {

  adc_oneshot_unit_handle_t adc1_handle;
  adc_oneshot_unit_init_cfg_t init_config1 = {
      .unit_id = ADC_UNIT_1,
  };
  ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config1, &adc1_handle));

  adc_oneshot_chan_cfg_t config = {
      .bitwidth = ADC_BITWIDTH_DEFAULT,
      .atten = ADC_ATTEN_DB_12,
  };
  adc_channel_t adc1_channel_vrx = VRX_PIN;
  adc_channel_t adc1_channel_vry = VRY_PIN;

  ESP_ERROR_CHECK(
      adc_oneshot_config_channel(adc1_handle, adc1_channel_vrx, &config));
  ESP_ERROR_CHECK(
      adc_oneshot_config_channel(adc1_handle, adc1_channel_vry, &config));

  gpio_reset_pin(SW_PIN);
  gpio_set_direction(SW_PIN, GPIO_MODE_INPUT);

  int sw_old = gpio_get_level(SW_PIN);
  int adc_raw[2];
  exp_date_t exp_date = {1, 1, 2024};
  command_t command = COMMAND_NONE;
  edit_state_t state = EDIT_DAY;

  scan_data_t scan_data;

  while (1) {
    if (xQueueReceive(queue, &scan_data, portMAX_DELAY)) {
      while (scan_data.hasScanned) {
        ESP_ERROR_CHECK(
            adc_oneshot_read(adc1_handle, adc1_channel_vrx, &adc_raw[0]));
        ESP_ERROR_CHECK(
            adc_oneshot_read(adc1_handle, adc1_channel_vry, &adc_raw[1]));

        command = COMMAND_NONE;
        int xValue = adc_raw[0];
        int yValue = adc_raw[1];

        if (xValue < LEFT_THRESHOLD) {
          command |= COMMAND_LEFT;
        } else if (xValue > RIGHT_THRESHOLD) {
          command |= COMMAND_RIGHT;
        }

        if (yValue < UP_THRESHOLD) {
          command |= COMMAND_UP;
        } else if (yValue > DOWN_THRESHOLD) {
          command |= COMMAND_DOWN;
        }

        if (command & COMMAND_LEFT) {
          switch (state) {
          case EDIT_DAY:
            break;
          case EDIT_MONTH:
            state = EDIT_DAY;
            break;
          case EDIT_YEAR:
            state = EDIT_MONTH;
            break;
          }
        }

        if (command & COMMAND_RIGHT) {
          switch (state) {
          case EDIT_DAY:
            state = EDIT_MONTH;
            break;
          case EDIT_MONTH:
            state = EDIT_YEAR;
            break;
          case EDIT_YEAR:
            break;
          }
        }

        if (command & COMMAND_UP) {
          switch (state) {
          case EDIT_DAY:
            exp_date.day = (exp_date.day == 31) ? 1 : exp_date.day + 1;
            break;
          case EDIT_MONTH:
            exp_date.month = (exp_date.month == 12) ? 1 : exp_date.month + 1;
            break;
          case EDIT_YEAR:
            exp_date.year = (exp_date.year == 2030) ? 2024 : exp_date.year + 1;
            break;
          }
        }

        if (command & COMMAND_DOWN) {
          switch (state) {
          case EDIT_DAY:
            exp_date.day = (exp_date.day == 1) ? 31 : exp_date.day - 1;
            break;
          case EDIT_MONTH:
            exp_date.month = (exp_date.month == 1) ? 12 : exp_date.month - 1;
            break;
          case EDIT_YEAR:
            exp_date.year = (exp_date.year == 2024) ? 2030 : exp_date.year - 1;
            break;
          }
        }

        display_set_text_fmt(dateLabel, "DATE: %02d%s/%02d%s/%d%s",
                             exp_date.day, (state == EDIT_DAY) ? "*" : "",
                             exp_date.month, (state == EDIT_MONTH) ? "*" : "",
                             exp_date.year, (state == EDIT_YEAR) ? "*" : "");

        int sw_new = gpio_get_level(SW_PIN);

        // if switch is pressed
        if (sw_old == 1 && sw_new == 0) {
          int err = publish_data(exp_date, (const char *)scan_data.code);

          if (err >= 0) {
            display_set_text_fmt(statusLabel,
                                 LV_SYMBOL_OK " Data sent successfully!");
          } else {
            display_set_text(statusLabel,
                             LV_SYMBOL_CLOSE " Error sending data!");
          }

          // reset date
          exp_date.day = 1;
          exp_date.month = 1;
          exp_date.year = 2024;

          scan_data.hasScanned = false;
          display_set_text(codeLabel, "Enter code: ");
          display_set_text(dateLabel, "Waiting for scan...");
          display_set_text(statusLabel, "");
        }

        sw_old = sw_new;

        vTaskDelay(150 / portTICK_PERIOD_MS);
      }
    }
  }

  vTaskDelay(150 / portTICK_PERIOD_MS);
}
