import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ItemView from "@/components/ItemView";
import { fetchItems } from "@/util/fetch";
import { View, Text } from "react-native";
import { defaultStyles } from "@/styles";
import { screenPadding } from "@/constants/tokens";
import { SearchContext } from "@/util/SearchContext";
import { useContext } from "react";
import { useHeaderHeight } from "@react-navigation/elements";

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

async function registerForPushNotificationsAsync() {
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
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
        });
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

export default function FridgeScreen() {
    const newScans = useSelector((state: RootState) => state.mqtt.scanResultMessage);
    const mqttConnected = useSelector((state: RootState) => state.mqtt.connected);
    const items = useSelector((state: RootState) => state.items.allItems);
    const todaysItems = useSelector((state: RootState) => state.items.todaysItems);
    const expiredItems = useSelector((state: RootState) => state.items.expiredItems);

    const [expoPushToken, setExpoPushToken] = useState("");

    const headerHeight = useHeaderHeight();
    const { search } = useContext(SearchContext);

    const filteredItems = useMemo(() => {
        if (!search) return items;

        return items.filter((item) =>
            (item.name + item.weight).toLowerCase().includes(search.toLowerCase())
        );
    }, [search, items]);

    useEffect(() => {
        fetchItems();
    }, [newScans]);

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            setExpoPushToken(token);
            // Send the token to your backend server
            sendTokenToBackend(token);
        });
    }, []);

    const sendTokenToBackend = (token) => {
        fetch("http://10.24.39.102:8080/register-token", {
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
    };
    return (
        <View style={defaultStyles.container}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: 128,
                    paddingHorizontal: screenPadding.horizontal,
                }}
            >
                {mqttConnected ? (
                    <>
                        {search === "" ? (
                            <View>
                                <ItemView title="Eat These" data={expiredItems} />
                                {todaysItems.length > 0 && (
                                    <ItemView title="Today's Items" data={todaysItems} />
                                )}
                                <ItemView title="All Items" data={items} />
                            </View>
                        ) : (
                            <ItemView
                                title={`Searching for '${search}'`}
                                data={filteredItems}
                                searching={true}
                            />
                        )}
                    </>
                ) : (
                    <Text style={defaultStyles.text}>Connect to MQTT first...</Text>
                )}
            </ScrollView>
        </View>
    );
}
