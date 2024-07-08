import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { StyleSheet, StatusBar, View, Text, FlatList } from "react-native";
import MqttUtils from "@/util/mqtt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function HomeScreen() {
  StatusBar.setBarStyle("dark-content");
  const connected = useSelector((state: RootState) => state.mqtt.connected);
  const messages = useSelector((state: RootState) => state.mqtt.messages);

  useEffect(() => {
    MqttUtils.connect("ios", "rawScan");

    return () => {
      MqttUtils.disconnect();
    };
  }, []);

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <>
          <Header />
          <Text style={{ color: connected ? "green" : "red" }}>
            MQTT Connection Status: {connected ? "Connected" : "Disconnected"}
          </Text>
          <Text>Messages:</Text>
        </>
      }
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.messageContainer}>
          <Text>
            <Text style={styles.boldText}>Topic:</Text> {item.topic}
          </Text>
          <Text>
            <Text style={styles.boldText}>Payload:</Text>{" "}
            {JSON.stringify(item.payload)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});
