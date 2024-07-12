import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ScrollView, StyleSheet, StatusBar } from "react-native";
import MqttUtils from "@/util/mqtt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ItemView from "@/components/ItemView";
import { RefrigeratorItem } from "@/redux/mqtt";
import { fetchItems } from "@/util/fetch";
import Notify from "@/components/Notify";
import { View } from "react-native";
import { defaultStyles } from "@/styles";
import { screenPadding } from "@/constants/tokens";

export default function FridgeScreen() {
    const connected = useSelector((state: RootState) => state.mqtt.connected);
    const newScans = useSelector((state: RootState) => state.mqtt.scanResultMessage);
    const [items, setItems] = useState<RefrigeratorItem[]>([]);
    const [todayItems, setTodayItems] = useState<RefrigeratorItem[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!connected) {
            MqttUtils.connect("ios", "scanResult");
        }

        if (newScans !== undefined) {
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
            }, 2500);
        }

        fetchItems().then((data) => {
            console.info("Fetching items");
            setItems(data.items);

            setTodayItems(
                data.items.filter((item: RefrigeratorItem) => {
                    const today = new Date();
                    const itemDate = new Date(item.expiration_date); // WARNING: Debug purposes only
                    return (
                        today.getDate() === itemDate.getDate() &&
                        today.getMonth() === itemDate.getMonth() &&
                        today.getFullYear() === itemDate.getFullYear()
                    );
                })
            );
        });
    }, [newScans]);

    return (
        <View style={defaultStyles.container}>
            <ScrollView style={{ paddingHorizontal: screenPadding.horizontal }}>
                <ItemView title="Eat These" data={items} />
                <ItemView title="Eat These" data={items} />
                <ItemView title="Eat These" data={items} />
                <ItemView title="Eat These" data={items} />
                <ItemView title="Eat These" data={items} />
            </ScrollView>

            <Notify
                isVisible={isModalVisible}
                setModalVisible={setModalVisible}
                title={newScans?.success_type}
                message={newScans?.message}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 10,
    },
    boldText: {
        fontWeight: "bold",
    },
});
