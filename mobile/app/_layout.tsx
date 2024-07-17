import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import Store from "../redux/store";
import { StatusBar } from "expo-status-bar";
import { SearchProvider } from "@/util/SearchContext";
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    const router = useRouter();

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <Provider store={Store}>
            <StatusBar style="dark" />
            <SearchProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="(modals)/[item]"
                        options={{
                            title: "View Item",
                            headerShown: true,
                            presentation: "modal",
                            headerLeft: () => (
                                <TouchableOpacity onPress={router.back}>
                                    <Ionicons
                                        name="arrow-back"
                                        size={24}
                                        color={"black"}
                                    />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                </Stack>
                <Toast position="bottom" bottomOffset={20} />
            </SearchProvider>
        </Provider>
    );
}
