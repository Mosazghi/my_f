import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    Button,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RefrigeratorItem } from "@/interfaces";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { deleteItem, fetchItems, updateItem } from "@/util/fetch";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditItem = () => {
    const { item } = useLocalSearchParams<{ item: string }>();
    const parsedItem: RefrigeratorItem = JSON.parse(item!);
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(parsedItem.name);
    const [expirationDate, setExpirationDate] = useState(
        new Date(parsedItem.expiration_date)
    );
    const [quantity, setQuantity] = useState(parsedItem.quantity.toString());
    const [weight, setWeight] = useState(parsedItem.weight || "");

    const handleSave = () => {
        const noChangesMade =
            name === parsedItem.name &&
            expirationDate.toLocaleDateString() ===
                new Date(parsedItem.expiration_date).toLocaleDateString() &&
            quantity === parsedItem.quantity.toString() &&
            weight === parsedItem.weight;

        if (!noChangesMade) {
            updateItem(parsedItem.barcode, {
                name,
                expiration_date: expirationDate.toLocaleDateString(),
                quantity: parseInt(quantity),
                weight,
            }).then(() => fetchItems());
            console.log("Item updated");
        } else {
            Toast.show({
                type: "info",
                text1: "No were changes made. Aborting save.",
            });
        }

        setIsEditing(false);
        router.back();
    };

    const handleDelete = () => {
        const confirmDelete = () => {
            deleteItem(parsedItem.barcode).then(() => fetchItems());
            router.back();
        };

        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this item?",
            [
                { text: "OK", onPress: confirmDelete },
                { text: "Dismiss", onPress: () => {} },
            ],
            { cancelable: true }
        );
    };

    return (
        <>
            <StatusBar style={"light"} />
            <ScrollView
                contentContainerStyle={styles.container}
                automaticallyAdjustKeyboardInsets={true}
            >
                {parsedItem.image_url && (
                    <Image
                        source={{ uri: parsedItem.image_url }}
                        style={styles.image}
                        contentFit="cover"
                        transition={1000}
                    />
                )}
                <View style={styles.infoContainer}>
                    <TextInput
                        style={{
                            ...styles.input,
                            ...styles.title,
                            borderWidth: isEditing ? 1 : 0,
                        }}
                        value={name}
                        onChangeText={setName}
                        editable={isEditing}
                        placeholder="Name"
                        multiline={true}
                    />
                    <View style={styles.row}>
                        <Text style={styles.label}>Expiration Date </Text>
                        <DateTimePicker
                            value={expirationDate}
                            onChange={(_, selectedDate) =>
                                setExpirationDate(selectedDate as Date)
                            }
                            style={{ flex: 1 }}
                            minimumDate={new Date()}
                            themeVariant="light"
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={{ ...styles.input, borderWidth: isEditing ? 1 : 0 }}
                            value={quantity}
                            onChangeText={setQuantity}
                            editable={isEditing}
                            placeholder="Quantity"
                            keyboardType="number-pad"
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Weight</Text>
                        <TextInput
                            style={{
                                ...styles.input,
                                borderWidth: isEditing ? 1 : 0,
                            }}
                            value={weight}
                            onChangeText={setWeight}
                            editable={isEditing}
                            placeholder="Weight"
                        />
                    </View>
                    {parsedItem.nutrition.length > 0 && (
                        <>
                            <Text style={styles.subtitle}>Nutrition Information:</Text>
                            {parsedItem.nutrition.map((nutrient, index) => (
                                <View key={index} style={styles.nutritionItem}>
                                    <Text style={styles.label}>
                                        {nutrient.display_name}:
                                        <Text style={styles.value}>
                                            {nutrient.amount}
                                            {nutrient.unit}
                                        </Text>
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}
                    <Text style={{ ...styles.label, marginTop: 20 }}>
                        Created At:{" "}
                        <Text style={styles.value}>
                            {new Date(parsedItem.created_at).toLocaleDateString()}
                        </Text>
                    </Text>

                    <Text style={{ ...styles.label, width: "100%" }}>
                        Barcode: <Text style={styles.value}>{parsedItem.barcode}</Text>
                    </Text>
                    <View style={styles.buttonContainer}>
                        {isEditing ? (
                            <Button title="Save" onPress={handleSave} />
                        ) : (
                            <Button title="Edit" onPress={() => setIsEditing(true)} />
                        )}
                        <Button title="Delete" onPress={handleDelete} color="red" />
                    </View>
                </View>
                <View style={{ height: 5 }} />
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "white",
        alignItems: "center",
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 5,
        marginBottom: 20,
    },
    infoContainer: {
        width: "100%",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "black",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        justifyContent: "space-between",
        width: "100%",
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        color: "black",
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
        color: "black",
    },
    value: {
        fontWeight: "normal",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 5,
        color: "black",
    },
    nutritionItem: {
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
    },
});

export default EditItem;
