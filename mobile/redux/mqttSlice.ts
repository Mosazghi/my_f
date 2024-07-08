import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  topic: string;
  payload: any;
}

interface MqttState {
  connected: boolean;
  messages: Message[];
}

const initialState: MqttState = {
  connected: false,
  messages: [],
};

const mqttSlice = createSlice({
  name: "mqtt",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
  },
});

export const { setConnected, addMessage } = mqttSlice.actions;

export default mqttSlice.reducer;
