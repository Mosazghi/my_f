// mqttUtils.ts
import init from "react_native_mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/redux/store";
import { setConnected, addMessage } from "../redux/mqttSlice";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

let client: Paho.MQTT.Client | null = null;

const mqttStates = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED",
};

let mqttState = mqttStates.NOT_CONNECTED;

export function isMqttConnected(): boolean {
  return mqttState === mqttStates.CONNECTED;
}

function onConnect(topic: string) {
  console.log("onConnect:: topic", topic);
  client?.subscribe(topic, { qos: 2 });
  mqttState = mqttStates.CONNECTED;
  store.dispatch(setConnected(true));
}

function onFailure(error: Error) {
  mqttState = mqttStates.NOT_CONNECTED;
  store.dispatch(setConnected(false));
  console.error("MQTT : connect error", error);
}

function onConnectionLost(responseObject: Paho.MQTT.MQTTError) {
  mqttState = mqttStates.NOT_CONNECTED;
  store.dispatch(setConnected(false));
  if (responseObject.errorCode !== 0) {
    setTimeout(() => {
      console.log(`onConnectionLost:${responseObject.errorMessage}`);
      // MqttUtils.reconnect();
    }, 2000);
  }
}

function onMessageArrived(message: Paho.MQTT.Message) {
  console.log("onMessageArrived:: topic: ", message.destinationName);
  let payload;
  try {
    payload = JSON.parse(message.payloadString);
  } catch (parseError) {
    payload = message.payloadString;
  }

  console.log("onMessageArrived:: payload: ", payload);
  store.dispatch(addMessage({ topic: message.destinationName, payload }));
}

export const waitConnect = () => {};

export const MqttUtils = {
  connect: (clientId: string, topic: string, reconnect?: boolean) => {
    const reconnectTimeout = 2000;
    const host = "192.168.1.168";
    const port = 8080;

    client = new Paho.MQTT.Client(host, port, clientId);
    console.log("MQTT : connecting...");
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    try {
      client.connect({
        onSuccess: () => {
          onConnect(topic);
        },
        onFailure,
        timeout: 3,
      });
    } catch (error) {
      onFailure(error as Error);
    }
  },
  disconnect: () => {
    try {
      if (client) {
        client.disconnect();
        client = null;
        console.log("MQTT : disconnected");
      }
    } catch (error) {
      onFailure(error as Error);
    }
  },

  unsubscribe: (topic: string) => {
    try {
      if (client) {
        client.unsubscribe(topic);
        console.log("MQTT : unsubscribed");
      }
    } catch (error) {
      onFailure(error as Error);
    }
  },
};

export default MqttUtils;
