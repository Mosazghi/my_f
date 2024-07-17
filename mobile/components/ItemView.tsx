import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import Item from "./Item";
import { RefrigeratorItem } from "@/redux/mqtt";
import { colors } from "@/constants/tokens";
import { useRouter } from "expo-router";
interface ItemViewProps {
    title: string;
    data: RefrigeratorItem[];
    searching?: boolean;
}

export default function ItemView({ data, title, searching = false }: ItemViewProps) {
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
            <FlatList
                horizontal={!searching}
                contentContainerStyle={{ gap: 15, paddingVertical: 15 }}
                data={data}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                        <Item {...item} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item, idx) => `${idx}`}
                scrollEnabled={!searching}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={200}
            />
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
