import { FlatList, Text, View, StyleSheet } from "react-native";
import Item from "./Item";
import { RefrigeratorItem } from "@/redux/mqtt";
import { colors } from "@/constants/tokens";

interface ItemViewProps {
    title: string;
    data: RefrigeratorItem[];
    searching?: boolean;
}

export default function ItemView({ data, title, searching = false }: ItemViewProps) {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>

            <FlatList
                horizontal={!searching}
                contentContainerStyle={{ gap: 15, paddingVertical: 15 }}
                data={data}
                renderItem={({ item }) => <Item {...item} />}
                keyExtractor={(item, idx) => `${idx}`}
                scrollEnabled={!searching}
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
