import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (!Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            alert("Failed to get push token for notifications!");
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo Push Token:", token);
    } else {
        alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return token;
}

export function sendTokenToBackend(token: string) {
    fetch("http://192.168.1.168:80/register-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Token registered:", data);
        })
        .catch((error) => {
            console.error("Error registering token:", error);
        });
}

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string>("");
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                setExpoPushToken(token);
                sendTokenToBackend(token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log("Notification received:", notification);
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log("Notification response received:", response);
            }
        );

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return expoPushToken;
}
