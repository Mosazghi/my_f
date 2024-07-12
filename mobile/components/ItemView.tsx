import { FlatList, Text, View, StyleSheet } from "react-native";
import Item from "./Item";
import { RefrigeratorItem } from "@/redux/mqtt";

import { utilsStyles } from "@/styles";
interface ItemViewProps {
    title: string;
    data: RefrigeratorItem[];
}

const ItemDivider = () => (
    <View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 90 }} />
);

export default function ItemView({ data, title }: ItemViewProps) {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={ItemDivider}
                data={data}
                renderItem={({ item }) => <Item {...item} />}
                keyExtractor={(item) => item.barcode.toString()}
                style={styles.container}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },

    title: {
        color: "black",
        fontSize: 22,
        fontWeight: "500",
    },
});
