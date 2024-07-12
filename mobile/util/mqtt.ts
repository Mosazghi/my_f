import init from "react_native_mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/redux/store";
import { setConnected, addMessage, NewScanMessage } from "../redux/mqtt";

enum MqttSate {
    CONNECTED = "CONNECTED",
    NOT_CONNECTED = "NOT_CONNECTED",
}

const HOST = "192.168.1.168";
// const HOST = "10.0.0.7";
const PORT = 8080;

// Init the mqtt client
init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    reconnect: true,
    sync: {},
});

let client: Paho.MQTT.Client | null = null;

let mqttState = MqttSate.NOT_CONNECTED;

export function isMqttConnected(): boolean {
    return mqttState === MqttSate.CONNECTED;
}

function onConnect(topic: string) {
    console.info("onConnect:: topic", topic);
    client?.subscribe(topic, { qos: 2 });
    mqttState = MqttSate.CONNECTED;
    store.dispatch(setConnected(true));
}

function onFailure(error: Error) {
    mqttState = MqttSate.NOT_CONNECTED;
    store.dispatch(setConnected(false));
    console.error("MQTT :: connect error", error);
}

function onConnectionLost(responseObject: Paho.MQTT.MQTTError) {
    mqttState = MqttSate.NOT_CONNECTED;
    store.dispatch(setConnected(false));
    if (responseObject.errorCode !== 0) {
        setTimeout(() => {
            console.log(`onConnectionLost:${responseObject.errorMessage}`);
        }, 2000);
    }
}

function onMessageArrived(message: Paho.MQTT.Message) {
    console.log("onMessageArrived:: topic: ", message.destinationName);
    let payload: NewScanMessage;
    try {
        payload = JSON.parse(message.payloadString);
    } catch (parseError) {
        payload = message.payloadString;
    }

    store.dispatch(addMessage({ ...payload }));
}

export const MqttUtils = {
    connect: (clientId: string, topic: string) => {
        client = new Paho.MQTT.Client(HOST, PORT, clientId);

        console.info("MQTT :: connecting...");

        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        try {
            client.connect({
                onSuccess: () => {
                    onConnect(topic);
                },
                onFailure,
                timeout: 3,
                reconnect: true,
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
                console.error("MQTT :: disconnected");
            }
        } catch (error) {
            onFailure(error as Error);
        }
    },

    unsubscribe: (topic: string) => {
        try {
            if (client) {
                client.unsubscribe(topic);
                console.error("MQTT :: unsubscribed");
            }
        } catch (error) {
            onFailure(error as Error);
        }
    },
};

export default MqttUtils;
