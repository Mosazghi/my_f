import React, { useEffect, useMemo } from "react";
import { ScrollView } from "react-native";
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

export default function FridgeScreen() {
    const newScans = useSelector((state: RootState) => state.mqtt.scanResultMessage);
    const mqttConnected = useSelector((state: RootState) => state.mqtt.connected);

    const items = useSelector((state: RootState) => state.items.allItems);
    const todaysItems = useSelector((state: RootState) => state.items.todaysItems);
    const expiredItems = useSelector((state: RootState) => state.items.expiredItems);

    const headerHeight = useHeaderHeight();
    const { search } = useContext(SearchContext);

    const filteredItems = useMemo(() => {
        if (!search) return items;

        return items.filter((item) =>
            (item.name + item.weight).toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    useEffect(() => {
        (async () => {
            await fetchItems();
        })();
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
