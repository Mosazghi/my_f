import { StyleSheet, Text, View } from "react-native";
import { MqttSuccessType } from "@/redux/mqtt";
import Modal from "react-native-modal";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Feather } from "@expo/vector-icons";

type NotifyProps = {
    isVisible: boolean;
    message?: string;
    title?: MqttSuccessType;
};

export default function Notify({ isVisible, message, title }: NotifyProps) {
    let borderColor = "",
        backgroundColor = "",
        Icon: JSX.Element = <></>;

    switch (title) {
        case MqttSuccessType.Success:
            borderColor = "darkseagreen";
            backgroundColor = "lightgreen";
            Icon = <AntDesign name="checkcircleo" size={24} color="white" />;
            break;
        case MqttSuccessType.Updated:
            borderColor = "skyblue";
            backgroundColor = "lightblue";
            Icon = <AntDesign name="exclamationcircleo" size={24} color="white" />;
            break;
        case MqttSuccessType.Failure:
            borderColor = "red";
            backgroundColor = "tomato";
            Icon = <Feather name="x-circle" size={24} color="white" />;
            break;
    }

    return (
        <Modal testID={"modal"} isVisible={isVisible} style={styles.view}>
            <View style={{ ...styles.content, borderColor, backgroundColor }}>
                {Icon}
                <Text style={styles.contentMessage}>{message}</Text>
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
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 2,
        gap: 14,
    },
    contentMessage: {
        fontSize: 15,
        marginBottom: 5,
        color: "white",
    },
});
