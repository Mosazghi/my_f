import React, { useEffect, useState } from "react";
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
import { RefrigeratorItem } from "@/redux/mqtt";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";

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
        console.log("Save item:", { name, expirationDate, quantity, weight });
        Alert.alert("Item saved successfully");
        setIsEditing(false);
        router.back();
    };

    const handleDelete = () => {
        console.log("Delete item:", parsedItem);
        Alert.alert("Item deleted successfully");
        router.back();
    };

    return (
        <>
            <StatusBar style={"light"} />
            <ScrollView contentContainerStyle={styles.container}>
                {parsedItem.image_url && (
                    <Image
                        source={{ uri: parsedItem.image_url }}
                        style={styles.image}
                        contentFit="cover"
                        transition={1000}
                    />
                )}
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>Edit Item</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={{ ...styles.input, borderWidth: isEditing ? 1 : 0 }}
                            value={name}
                            onChangeText={setName}
                            editable={isEditing}
                            placeholder="Name"
                            multiline={true}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Expiration Date{" "}
                            <Text style={{ color: "gray", fontStyle: "italic" }}>
                                {expirationDate > new Date() ? "(Good)" : "(Expired)"}
                            </Text>
                        </Text>
                        <TextInput
                            style={{ ...styles.input, borderWidth: isEditing ? 1 : 0 }}
                            value={expirationDate.toLocaleDateString()}
                            onChangeText={setExpirationDate.toString}
                            editable={isEditing}
                            placeholder="Expiration Date"
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
                    {parsedItem.weight !== null && (
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
                    )}
                    <Text style={styles.label}>
                        Barcode: <Text style={styles.value}>{parsedItem.barcode}</Text>
                    </Text>
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
                    <Text style={styles.label}>
                        Created At:{" "}
                        <Text style={styles.value}>
                            {new Date(parsedItem.created_at).toLocaleDateString()}
                        </Text>
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
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        color: "black",
        width: "100%",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
        color: "black",
        width: "50%",
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
