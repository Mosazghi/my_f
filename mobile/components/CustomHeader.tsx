import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { useContext } from "react";
import { SearchContext } from "@/util/SearchContext";
import * as Animatable from "react-native-animatable";
import { FontAwesome6 } from "@expo/vector-icons";

import { Keyboard } from "react-native";
type CustomHeaderProps = {
    showSearch?: boolean;
    title?: string;
    RightComponent?: React.FC;
};
const CustomHeader = ({
    showSearch = true,
    title = "My Fridge",
    RightComponent = ConnectionStatusBar,
}: CustomHeaderProps) => {
    const { top } = useSafeAreaInsets();
    const { search, setSearch } = useContext(SearchContext);

    const handleClearSearch = () => {
        setSearch("");
        Keyboard.dismiss();
    };

    return (
        <BlurView intensity={80} tint={"extraLight"} style={{ paddingTop: top }}>
            <View
                style={{
                    ...styles.container,
                    height: 60,
                    gap: 10,
                    paddingHorizontal: 20,
                    justifyContent: "space-between",
                }}
            >
                <Text style={{ ...styles.title }}>{title}</Text>
                {showSearch && (
                    <View style={styles.searchSection}>
                        <Ionicons
                            style={styles.searchIcon}
                            name="search"
                            size={20}
                            color={Colors.dark}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Search in your fridge..."
                            placeholderTextColor={Colors.dark}
                            value={search}
                            onChangeText={(text) => setSearch(text)}
                        />

                        {search.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Animatable.View
                                    animation={search.length > 0 ? "fadeIn" : "fadeOut"}
                                    duration={1000}
                                >
                                    <FontAwesome6
                                        name="x"
                                        size={16}
                                        style={styles.clear}
                                    />
                                </Animatable.View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <RightComponent />
            </View>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.dark,
    },
    searchSection: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
        borderRadius: 30,
    },
    searchIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 0,
        paddingBottom: 10,
        paddingLeft: 0,
        backgroundColor: Colors.lightGray,
        color: Colors.dark,
        borderRadius: 30,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    clear: {
        padding: 10,
    },
});
export default CustomHeader;
