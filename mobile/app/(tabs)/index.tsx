import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
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
import { SearchContext } from "@/util/SearchContext";
import { useContext } from "react";
import { useHeaderHeight } from "@react-navigation/elements";

export default function FridgeScreen() {
    const connected = useSelector((state: RootState) => state.mqtt.connected);
    const newScans = useSelector((state: RootState) => state.mqtt.scanResultMessage);

    const [items, setItems] = useState<RefrigeratorItem[]>([]);
    const [todaysItems, setTodayItems] = useState<RefrigeratorItem[]>([]);
    const [expiredItems, setExpiredItems] = useState<RefrigeratorItem[]>([]);

    const [isNotifyVisible, setModalVisible] = useState(false);
    const headerHeight = useHeaderHeight();
    const { search } = useContext(SearchContext);

    const filteredItems = useMemo(() => {
        if (!search) return items;

        return items.filter((item) =>
            (item.name + item.weight).toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    useEffect(() => {
        if (!connected) {
            MqttUtils.connect("client", "scanResult");
        }

        if (newScans !== undefined) {
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
            }, 2500);
        }

        fetchItems().then((data) => {
            console.info("Fetching items");
            if (data.success === false) {
                console.error("Failed to fetch items");
                return;
            }
            setItems(data!.items);

            data!.items.filter((item: RefrigeratorItem) => {
                const todayDate = new Date();
                const itemDate = new Date(item.expiration_date); // WARNING: Debug purposes only

                if (
                    todayDate.getDate() === itemDate.getDate() &&
                    todayDate.getMonth() === itemDate.getMonth() &&
                    todayDate.getFullYear() === itemDate.getFullYear()
                )
                    setTodayItems((prev) => [...prev, item]);

                if (todayDate > itemDate) setExpiredItems((prev) => [...prev, item]);
            });
        });
    }, [newScans]);

    return (
        <View style={defaultStyles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 128 }}
                style={{
                    ...styles.itemViewContainer,
                    paddingHorizontal: screenPadding.horizontal,
                }}
            >
                {!search && (
                    <View>
                        <ItemView title="Eat These" data={expiredItems} />
                        {todaysItems.length > 0 && (
                            <ItemView title="Today's Items" data={todaysItems} />
                        )}
                        <ItemView title="All Items" data={items} />
                    </View>
                )}

                {search && (
                    <ItemView
                        title={`Searching for '${search}'`}
                        data={filteredItems}
                        searching={true}
                    />
                )}
            </ScrollView>

            <Notify
                isVisible={isNotifyVisible}
                title={newScans?.success_type}
                message={newScans?.message}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    itemViewContainer: {},
});
