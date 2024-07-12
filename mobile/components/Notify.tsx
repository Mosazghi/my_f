import { StyleSheet, Text, View } from "react-native";
import { MqttSuccessType } from "@/redux/mqtt";
import Modal from "react-native-modal";

type NotifyProps = {
    isVisible: boolean;
    setModalVisible: (isVisible: boolean) => void;
    message?: string;
    title?: MqttSuccessType;
};

export default function Notify({
    isVisible,
    setModalVisible,
    message,
    title,
}: NotifyProps) {
    return (
        <Modal
            testID={"modal"}
            isVisible={isVisible}
            onSwipeComplete={() => setModalVisible(false)}
            swipeDirection={["up", "left", "right", "down"]}
            style={styles.view}
        >
            <View style={styles.content}>
                <Text style={styles.contentTitle}>{title}</Text>
                <Text style={styles.contentTitle}>{message}</Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    view: {
        justifyContent: "flex-end",
        margin: 0,
    },
    content: {
        backgroundColor: "white",
        padding: 22,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)",
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },

    contentMessage: {
        fontSize: 15,
        marginBottom: 5,
    },
});
