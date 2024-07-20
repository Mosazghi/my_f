import { Tabs } from "expo-router";
import React from "react";
import { colors, fontSize } from "@/constants/tokens";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomHeader from "@/components/CustomHeader";
import { RefreshButton } from "@/components/RefreshButton";
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "rgba(255, 255, 255, 0.9)",
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: "500",
                },
                tabBarStyle: {
                    position: "absolute",
                    borderTopWidth: 0,
                    paddingTop: 8,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={30}
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            overflow: "hidden",
                            backgroundColor: colors.blur,
                        }}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="fridge"
                options={{
                    title: "Fridge",
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "fridge" : "fridge-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                    header: () => <CustomHeader RightComponent={RefreshButton} />,
                    headerTransparent: true,
                }}
            />

            <Tabs.Screen
                name="index"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "settings" : "settings-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                    header: () => <CustomHeader showSearch={false} title="Settings" />,
                    headerTransparent: true,
                }}
            />
        </Tabs>
    );
}
