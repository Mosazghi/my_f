import { colors } from "@/constants/tokens";
import { RefrigeratorItem } from "@/redux/mqtt";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

export default function Item({
    image_url,
    name,
    expiration_date,
    weight,
}: RefrigeratorItem) {
    const expirationDateObject = new Date(expiration_date);
    const isGood = expirationDateObject > new Date();

    return (
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Image
                    source={
                        image_url
                            ? { uri: image_url }
                            : require("../assets/images/react-logo.png")
                    }
                    style={styles.image}
                    contentFit="cover"
                    transition={1000}
                />
                <Text numberOfLines={2} style={styles.itemName}>
                    {name}
                </Text>
            </View>
            <View style={styles.itemFooter}>
                {weight && <Text style={styles.itemWeight}>{weight}</Text>}
                <Text style={{ color: isGood ? "green" : "tomato" }}>
                    {isGood ? "Good" : "Expired"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.textMuted,
        maxWidth: 190,
    },

    itemHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: colors.textMuted,
        marginBottom: 10,
        gap: 10,
    },
    image: {
        width: 70,
        height: 70,
        backgroundColor: "#0553",
        borderRadius: 20,
    },

    itemName: {
        fontSize: 13,
        fontWeight: "condensed",
        width: 100,
    },

    itemFooter: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemWeight: {
        fontSize: 16,
    },
    modal: {
        backgroundColor: "white",
        maxHeight: 200,
        padding: 20,
        borderRadius: 10,
    },
});
