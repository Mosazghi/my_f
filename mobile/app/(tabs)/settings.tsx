import { colors } from "@/constants/tokens";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";

export default function SettingsScreen() {
    return (
        <SafeAreaView>
            <Text style={styles.test}>Hello World</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
    test: {
        color: colors.textLight,
    },
});
