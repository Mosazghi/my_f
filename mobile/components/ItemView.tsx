import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import Item from "./Item";
import { RefrigeratorItem } from "@/interfaces";
import { colors } from "@/constants/tokens";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ItemViewProps {
    title: string;
    data: RefrigeratorItem[];
    searching?: boolean;
}

export default function ItemView({ data, title, searching = false }: ItemViewProps) {
    const isRefreshing = useSelector((state: RootState) => state.items.refreshing);
    const router = useRouter();

    const handleEdit = (item: RefrigeratorItem) => {
        router.push({
            pathname: "(modals)/[item]",
            params: { item: JSON.stringify(item) },
        });
    };
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            {!isRefreshing ? (
                <FlatList
                    horizontal={!searching}
                    contentContainerStyle={{ gap: 15, paddingVertical: 15 }}
                    data={data}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Item {...item} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(_, idx) => `${idx}`}
                    scrollEnabled={!searching}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    snapToInterval={200}
                />
            ) : (
                <ActivityIndicator size="small" color={colors.primary} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        color: colors.text,
        fontSize: 22,
        fontWeight: "500",
    },
});
