import init from "react_native_mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Store from "@/redux/store";
import { setConnected, addMessage, NewScanMessage } from "../redux/mqtt";

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

function onConnect(topic: string) {
    console.info("onConnect:: topic", topic);
    client?.subscribe(topic, { qos: 2 });
    Store.dispatch(setConnected(true));
}

function onFailure(error: Error) {
    Store.dispatch(setConnected(false));
    console.info("MQTT :: connect error", error);
}

function onConnectionLost(responseObject: Paho.MQTT.MQTTError) {
    Store.dispatch(setConnected(false));
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

    Store.dispatch(addMessage({ ...payload }));
}

export const MqttUtils = {
    connect: (host: string, port: number, callback: (error?: Error) => void) => {
        const clientId = "mobile";
        const topic = "scanResult";
        client = new Paho.MQTT.Client(host, port, clientId);

        console.info("MQTT :: connecting...");

        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        client.connect({
            onSuccess: () => {
                onConnect(topic);
                callback(); // No error, connection successful
            },
            onFailure: (error: Error) => {
                callback(error); // Pass the error to the callback
            },
            timeout: 3,
            reconnect: true,
        });
    },

    disconnect: () => {
        if (client) {
            client.disconnect();
            client = null;
            console.info("MQTT :: disconnected");
        }
    },

    unsubscribe: (topic: string) => {
        if (client) {
            client.unsubscribe(topic);
            console.info("MQTT :: unsubscribed");
        }
    },
};

export default MqttUtils;
