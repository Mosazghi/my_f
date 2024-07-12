import { RefrigeratorItem } from "@/redux/mqtt";
import React, { useState, useEffect } from "react";
import { View, Text, Image, Button, StyleSheet, TouchableHighlight } from "react-native";
import Modal from "react-native-modal";

export default function Item({
    image_url,
    name,
    expiration_date,
    nutrition,
    weight,
    created_at,
}: RefrigeratorItem) {
    const [isModalVisible, setModalVisible] = useState(false);

    const expirationDateObject = new Date(expiration_date);
    const isGood = expirationDateObject > new Date();

    return (
        <>
            <TouchableHighlight onPress={() => setModalVisible(true)}>
                <View style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                        <Image
                            source={
                                image_url
                                    ? { uri: image_url }
                                    : require("../assets/images/react-logo.png")
                            }
                            style={styles.image}
                        />
                        <Text style={styles.itemName}>{name}</Text>
                    </View>
                    <View style={styles.itemFooter}>
                        {weight && <Text style={styles.itemWeight}>{weight}</Text>}
                        <Text style={{ color: isGood ? "green" : "red" }}>
                            {isGood ? "Good" : "Bad"}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>

            <Modal style={styles.modal} isVisible={isModalVisible}>
                <Text>Expiration date: {expirationDateObject.toDateString()}</Text>
                <Button title="Close" onPress={() => setModalVisible(false)} />
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 10,
        backgroundColor: "#f8f8f8",
        borderRadius: 5,
        maxWidth: 300,
    },
    itemHeader: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: 10,
    },
    image: {
        width: 70,
        height: 70,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "condensed",
        maxWidth: "50%",
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
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor: "white",
        maxHeight: 200,
        padding: 20,
        borderRadius: 10,
    },
});
