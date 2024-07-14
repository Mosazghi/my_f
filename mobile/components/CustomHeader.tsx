import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { useContext } from "react";
import { SearchContext } from "@/util/SearchContext";

type CustomHeaderProps = {
    showSearch?: boolean;
    title?: string;
};
const CustomHeader = ({ showSearch = true, title = "My Fridge" }: CustomHeaderProps) => {
    const { top } = useSafeAreaInsets();
    const { search, setSearch } = useContext(SearchContext);

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
                            placeholder="Search"
                            placeholderTextColor={Colors.dark}
                            onChange={(e) => setSearch(e.nativeEvent.text)}
                        />
                    </View>
                )}
                <ConnectionStatusBar />
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
    btn: {
        padding: 10,
        backgroundColor: Colors.gray,
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
        paddingRight: 10,
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
});
export default CustomHeader;
