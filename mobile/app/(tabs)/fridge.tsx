import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ItemView from "@/components/ItemView";
import { MqttSuccessType, RefrigeratorItem } from "@/redux/mqtt";
import { fetchItems } from "@/util/fetch";
import { View, Text } from "react-native";
import { defaultStyles } from "@/styles";
import { screenPadding } from "@/constants/tokens";
import { SearchContext } from "@/util/SearchContext";
import { useContext } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import Toast from "react-native-toast-message";

export default function FridgeScreen() {
    const newScans = useSelector((state: RootState) => state.mqtt.scanResultMessage);
    const mqttConnected = useSelector((state: RootState) => state.mqtt.connected);

    const [items, setItems] = useState<RefrigeratorItem[]>([]);
    const [todaysItems, setTodaysItems] = useState<RefrigeratorItem[]>([]);
    const [expiredItems, setExpiredItems] = useState<RefrigeratorItem[]>([]);

    const headerHeight = useHeaderHeight();
    const { search } = useContext(SearchContext);

    const filteredItems = useMemo(() => {
        if (!search) return items;

        return items.filter((item) =>
            (item.name + item.weight).toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    useEffect(() => {
        if (newScans !== undefined) {
            let title = "";
            let info = "";
            if (
                newScans.success_type === MqttSuccessType.Success ||
                newScans.success_type === MqttSuccessType.Error
            ) {
                [title, info] = newScans.message.split("\n");
            }

            Toast.show({
                type: newScans.success_type.toString().toLowerCase(),

                text1: title || newScans.message,
                text2: info || "",
            });
        }

        fetchItems().then((data) => {
            console.info("Fetching items");
            if (data.success === false) {
                console.error("Failed to fetch items");
                return;
            }
            setItems(data.items);

            let tempTodaysItems: RefrigeratorItem[] = [];
            let tempExpiredItems: RefrigeratorItem[] = [];

            data.items.filter((item: RefrigeratorItem) => {
                const todayDate = new Date();
                const itemDate = new Date(item.expiration_date); // WARNING: Debug purposes only

                if (
                    todayDate.getDate() === itemDate.getDate() &&
                    todayDate.getMonth() === itemDate.getMonth() &&
                    todayDate.getFullYear() === itemDate.getFullYear()
                ) {
                    tempTodaysItems.push(item);
                }

                if (todayDate > itemDate) tempExpiredItems.push(item);
            });

            setTodaysItems(tempTodaysItems);
            setExpiredItems(tempExpiredItems);
        });
    }, [newScans]);

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

const styles = StyleSheet.create({
    itemViewContainer: {},
});
