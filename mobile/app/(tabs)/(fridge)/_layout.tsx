import { StackScreenWithSearchBar } from "@/constants/layout";
import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function FridgeScreenLayout() {
    return (
        <View style={defaultStyles.container}>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        ...StackScreenWithSearchBar,
                        headerTitle: "My Fridge",
                    }}
                />
            </Stack>
        </View>
    );
}
