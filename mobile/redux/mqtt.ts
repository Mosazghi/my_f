import { NewScanMessage } from "@/interfaces";
import { MqttSuccessType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

interface MqttState {
    connected: boolean;
    scanResultMessage?: NewScanMessage;
}

const initialState: MqttState = {
    connected: false,
    scanResultMessage: undefined,
};

const MqttSlice = createSlice({
    name: "mqtt",
    initialState,
    reducers: {
        setConnected(state, action: PayloadAction<boolean>) {
            state.connected = action.payload;
        },
        addMessage(state, action: PayloadAction<NewScanMessage>) {
            if (action.payload) {
                state.scanResultMessage = action.payload;

                let title = "";
                let info = "";
                if (
                    action.payload.success_type === MqttSuccessType.Success ||
                    action.payload.success_type === MqttSuccessType.Error
                ) {
                    [title, info] = action.payload.message.split("\n");
                }

                Toast.show({
                    type: action.payload.success_type.toString().toLowerCase(),

                    text1: title || action.payload.message,
                    text2: info || "",
                });
            }
        },
    },
});

export const { setConnected, addMessage } = MqttSlice.actions;

export default MqttSlice.reducer;
