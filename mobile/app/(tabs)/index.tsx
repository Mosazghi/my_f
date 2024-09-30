import {
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { defaultStyles } from "@/styles";
import { useHeaderHeight } from "@react-navigation/elements";
import { screenPadding } from "@/constants/tokens";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Colors from "@/constants/Colors";
import MqttUtils from "@/util/mqtt";
import { useRouter } from "expo-router";
import { getIpAddressAsync } from "expo-network";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
    const [host, setHost] = useState("");
    const [port, setPort] = useState("9001");
    const [isLoading, setIsLoading] = useState(false);

    const headerHeight = useHeaderHeight();
    const router = useRouter();

    const connected = useSelector((state: RootState) => state.mqtt.connected);

    useEffect(() => {
        const fetchIP = async () => {
            const ip = await getIpAddressAsync();
            setHost(ip);
        };

        fetchIP();
    }, []);

    const handleConnect = () => {
        if (!connected) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                MqttUtils.connect(host, Number(port), (error) => {
                    if (error) {
                        Toast.show({
                            type: "error",
                            text1: "Failed to connect. Check your settings.",
                        });
                    } else {
                        clearTimeout(timer);
                        router.push("/fridge");
                    }
                });

                setIsLoading(false);
            }, 1000);
        }
    };

    const handleDisconnect = () => {
        if (connected) {
            try {
                MqttUtils.disconnect();
            } catch (error) {
                console.error("Failed to disconnect", error);
            }
        }
    };

    return (
        <View style={defaultStyles.container}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: headerHeight,
                    paddingBottom: 128,
                    paddingHorizontal: screenPadding.horizontal,
                }}
                scrollEnabled={false}
            >
                <View style={styles.inputContainer}>
                    <Text>Host:</Text>
                    <TextInput
                        value={host}
                        onChangeText={setHost}
                        placeholder="Host"
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text>Port:</Text>
                    <TextInput
                        value={port}
                        onChangeText={setPort}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
                <TouchableOpacity
                    onPress={connected ? handleDisconnect : handleConnect}
                    style={{
                        ...styles.submitButton,
                        backgroundColor: connected ? "red" : "green",
                    }}
                >
                    <Text style={{ color: "white" }}>
                        {isLoading ? (
                            <ActivityIndicator
                                size="small"
                                color="white"
                                animating={isLoading}
                            />
                        ) : connected ? (
                            "Disconnect"
                        ) : (
                            "Connect"
                        )}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        paddingVertical: 10,
    },
    input: {
        paddingVertical: 5,
        paddingLeft: 10,
        backgroundColor: Colors.lightGray,
        color: Colors.dark,
        borderRadius: 5,
    },
    submitButton: {
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
    },
});
