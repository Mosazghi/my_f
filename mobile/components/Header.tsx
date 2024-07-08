import { View, StyleSheet } from "react-native";
import { SearchBar } from "@rneui/themed";
import { useState } from "react";
import { Text } from "@rneui/themed";
export function Header() {
  const [search, setSearch] = useState<string>("");

  const updateSearch = (search: string) => {
    console.log(search);
    setSearch(search);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>My Fridge</Text>
      <SearchBar
        placeholder="Fish, Chicken, Beef..."
        onChangeText={updateSearch}
        value={search}
        inputStyle={{ backgroundColor: "white" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginVertical: 10,
  },
  title: {
    color: "Black",
    fontSize: 30,
    fontWeight: "bold",
  },
  search: {
    backgroundColor: "red",
    padding: 10,
  },
});
