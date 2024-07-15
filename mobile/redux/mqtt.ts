import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Nutrition = {
    name: string;
    amount: number;
    unit: string;
};

export interface RefrigeratorItem {
    barcode: string;
    name: string;
    expiration_date: Date;
    quantity: number;
    nutrition?: Nutrition[];
    weight?: string;
    created_at: Date;
    image_url?: string;
}

export enum MqttSuccessType {
    Success,
    Error,
    Info,
}

export interface NewScanMessage {
    message: string;
    success_type: MqttSuccessType;
}

interface MqttState {
    connected: boolean;
    scanResultMessage?: NewScanMessage;
}

const initialState: MqttState = {
    connected: false,
    scanResultMessage: undefined,
};

const mqttSlice = createSlice({
    name: "mqtt",
    initialState,
    reducers: {
        setConnected(state, action: PayloadAction<boolean>) {
            state.connected = action.payload;
        },
        addMessage(state, action: PayloadAction<NewScanMessage>) {
            state.scanResultMessage = action.payload;
        },
    },
});

export const { setConnected, addMessage } = mqttSlice.actions;

export default mqttSlice.reducer;
