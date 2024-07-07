#include "util.h"
#include "cJSON.h"
#include "joystick.h"
#include "mqtt.h"
char *exp_date_to_string(exp_date_t exp_date) {
  char *buf = (char *)malloc(16);
  // return formatted string of expiration date
  snprintf(buf, 16, "%d/%d/%d", exp_date.day, exp_date.month, exp_date.year);
  return buf;
}

int publish_data(exp_date_t exp_date, const char *code) {
  int err = 0;
  cJSON *data = cJSON_CreateObject();
  char *exp_date_str = exp_date_to_string(exp_date);
  cJSON_AddStringToObject(data, "barcode", (char *)code);
  cJSON_AddStringToObject(data, "expDate", exp_date_str);
  char *json = cJSON_Print(data);

  err = mqtt_publish("rawScan", json);

  cJSON_free(json);
  cJSON_Delete(data);
  free(exp_date_str);

  return err;
}
