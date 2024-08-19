import { FlatList, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Item from "./Item";
import { RefrigeratorItem } from "@/interfaces";
import { colors } from "@/constants/tokens";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native";

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
            pathname: "/(modals)/[item]",
            params: { item: JSON.stringify(item) },
        });
    };
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            <View style={{ paddingVertical: 15 }}>
                <FlatList
                    horizontal={!searching}
                    contentContainerStyle={{ gap: 15 }}
                    data={isRefreshing ? new Array(3) : data}
                    renderItem={({ item }) =>
                        isRefreshing ? (
                            <SkeletonItem />
                        ) : (
                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                <Item {...item} />
                            </TouchableOpacity>
                        )
                    }
                    keyExtractor={(_, idx) => `${idx}`}
                    scrollEnabled={!searching}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    snapToInterval={200}
                />
            </View>
        </View>
    );
}

const SkeletonItem = () => {
    return (
        <ContentLoader
            speed={2}
            width={100}
            height={100}
            viewBox="0 0 100 100"
            backgroundColor="#a7a7a7"
            foregroundColor="#ecebeb"
        >
            <Rect x="62" y="22" rx="3" ry="3" width="52" height="6" />
            <Circle cx="28" cy="25" r="26" />
            <Rect x="62" y="7" rx="3" ry="3" width="52" height="6" />
            <Rect x="11" y="62" rx="3" ry="3" width="29" height="7" />
            <Rect x="69" y="61" rx="3" ry="3" width="29" height="8" />
        </ContentLoader>
    );
};

const styles = StyleSheet.create({
    title: {
        color: colors.text,
        fontSize: 22,
        fontWeight: "500",
    },
});
