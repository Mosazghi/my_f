import { View } from "react-native";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as Animatable from "react-native-animatable";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export function ConnectionStatusBar() {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const isMqttConnected = useSelector((state: RootState) => state.mqtt.connected);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible((prevState) => !prevState);
        }, 1000);

        console.info("Connection status bar", isMqttConnected);

        if (!isMqttConnected) clearInterval(interval);
        return () => clearInterval(interval);
    }, [isMqttConnected]);

    return (
        <View>
            <View>
                <Animatable.View
                    animation={isVisible ? "fadeIn" : "fadeOut"}
                    duration={1000}
                >
                    <FontAwesome6
                        name="tower-broadcast"
                        size={19}
                        color={isMqttConnected ? "green" : "orangered"}
                    />
                </Animatable.View>
            </View>
        </View>
    );
}
