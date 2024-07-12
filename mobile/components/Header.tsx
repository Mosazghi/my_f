import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
// import { Text } from "@rneui/themed";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as Animatable from "react-native-animatable";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export function Header() {
    const [search, setSearch] = useState<string>("");
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const isMqttConnected = useSelector((state: RootState) => state.mqtt.connected);

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible((prevState) => !prevState);
        }, 1000);

        if (!isMqttConnected) clearInterval(interval);
        return () => clearInterval(interval);
    }, [isMqttConnected]);

    return (
        <View style={styles.header}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                }}
            >
                <Text style={styles.title}>My Fridge</Text>
                <Animatable.View
                    animation={isVisible ? "fadeIn" : "fadeOut"}
                    duration={1000}
                >
                    <FontAwesome6
                        name="tower-broadcast"
                        size={19}
                        color={isMqttConnected ? "green" : "red"}
                    />
                </Animatable.View>
            </View>
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <FontAwesome6
                        name="magnifying-glass"
                        size={18}
                        color="#000"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        placeholder="Fish, Chicken, Beef..."
                        onChangeText={updateSearch}
                        value={search}
                        style={styles.searchInput}
                    />

                    {search.length > 0 && (
                        <TouchableOpacity
                            style={styles.clear}
                            onPress={() => setSearch("")}
                        >
                            <Animatable.View
                                animation={search.length > 0 ? "fadeIn" : "fadeOut"}
                                duration={1000}
                            >
                                <FontAwesome6 name="x" size={17} color="" />
                            </Animatable.View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 5,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginVertical: 10,
    },
    title: {
        color: "black",
        fontSize: 30,
        fontWeight: "bold",
    },
    searchWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        padding: 15,
        paddingHorizontal: 45,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "lightgray",
    },
    searchIcon: {
        position: "absolute",
        left: 10,
        zIndex: 10,
        paddingLeft: 5,
    },
    clear: {
        position: "absolute",
        right: 10,
        zIndex: 10,
        paddingRight: 5,
        padding: 10,
        marginLeft: 10,
    },
});
