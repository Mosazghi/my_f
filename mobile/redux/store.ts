import { configureStore } from "@reduxjs/toolkit";
import mqttReducer from "./mqtt";

export const store = configureStore({
    reducer: {
        mqtt: mqttReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
