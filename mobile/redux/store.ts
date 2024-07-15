import { configureStore } from "@reduxjs/toolkit";
import mqttReducer from "./mqtt";

const Store = configureStore({
    reducer: {
        mqtt: mqttReducer,
    },
});

export type RootState = ReturnType<typeof Store.getState>;

export default Store;
