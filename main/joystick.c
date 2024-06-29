#include "joystick.h"

#include "driver/gpio.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "freertos/message_buffer.h"
#include "freertos/projdefs.h"
#include "freertos/task.h"
#include "portmacro.h"
#include "soc/adc_channel.h"

const char *TAG = "joystick";

QueueHandle_t date_queue;

void joystick_task(void *args) {
  // ADC1 Config
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

  // Initialize GPIO
  gpio_reset_pin(SW_PIN);
  gpio_set_direction(SW_PIN, GPIO_MODE_INPUT);

  // Variables
  int sw_old = gpio_get_level(SW_PIN);
  int adc_raw[2];
  exp_date_t exp_date = {01, 01, 2024};
  command_t command = COMMAND_NONE;
  edit_state_t state = EDIT_DAY;

  date_queue = xQueueCreate(1, sizeof(exp_date_t));

  while (1) {
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
      ESP_LOGI(TAG, "COMMAND LEFT");
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
      ESP_LOGI(TAG, "COMMAND RIGHT");
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
      ESP_LOGI(TAG, "COMMAND UP");
      switch (state) {
      case EDIT_DAY:
        if (exp_date.day == 31)
          exp_date.day = 1;
        else
          exp_date.day++;

        break;
      case EDIT_MONTH:
        if (exp_date.month == 12)
          exp_date.month = 1;
        else
          exp_date.month++;
        break;
      case EDIT_YEAR:
        if (exp_date.year == 2030)
          exp_date.year = 2024;
        else
          exp_date.year++;
        break;
      }
    }

    if (command & COMMAND_DOWN) {
      ESP_LOGI(TAG, "COMMAND DOWN");
      switch (state) {
      case EDIT_DAY:
        exp_date.day--;
        if (exp_date.day < 1)
          exp_date.day = 31;
        break;
      case EDIT_MONTH:
        exp_date.month--;
        if (exp_date.month < 1)
          exp_date.month = 12;
        break;
      case EDIT_YEAR:
        exp_date.year--;
        if (exp_date.year < 2024)
          exp_date.year = 2030;
        break;
      }
    }

    int sw_new = gpio_get_level(SW_PIN);

    if (sw_old == 1 && sw_new == 0) {
      ESP_LOGI(TAG, "BUTTON PRESSED");
      printf("Sending date: %d/%d/%d\n", exp_date.day, exp_date.month,
             exp_date.year);
      if (xQueueSend(date_queue, &exp_date, portMAX_DELAY) != pdPASS) {
        ESP_LOGE(TAG, "Failed to send date to queue");
      }
      exp_date.day = 1;
      exp_date.month = 1;
      exp_date.year = 2024;
    }
    sw_old = sw_new;

    printf("Date: %d%s/%d%s/%d%s\n", exp_date.day,
           (state == EDIT_DAY) ? "*" : "", exp_date.month,
           (state == EDIT_MONTH) ? "*" : "", exp_date.year,
           (state == EDIT_YEAR) ? "*" : "");

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}
