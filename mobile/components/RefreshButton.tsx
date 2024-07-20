import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { fetchItems } from "@/util/fetch";
import { FontAwesome } from "@expo/vector-icons";
import { toggleRefreshing } from "@/redux/items";
import Store from "@/redux/store";

export function RefreshButton() {
    const [refreshing, setRefreshing] = useState(false);
    const rotation = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateZ: `${rotation.value}deg`,
                },
            ],
        };
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        Store.dispatch(toggleRefreshing());
        await fetchItems();
        setTimeout(() => {
            setRefreshing(false);
            Store.dispatch(toggleRefreshing());
        }, 1000);
    }, []);

    useEffect(() => {
        if (refreshing) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 1000,
                    easing: Easing.linear,
                }),
                -1
            );
        } else {
            cancelAnimation(rotation);
            rotation.value = 0;
        }
    }, [refreshing]);

    return (
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Animated.View style={[animatedStyles]}>
                <FontAwesome name="refresh" size={24} />
            </Animated.View>
        </TouchableOpacity>
    );
}
