import { configureStore, combineReducers } from "@reduxjs/toolkit";
import mqttReducer from "./mqtt";
import itemsReducer from "./items";

const rootReducer = combineReducers({
    mqtt: mqttReducer,
    items: itemsReducer,
});

const Store = configureStore({ reducer: rootReducer });

export type RootState = ReturnType<typeof Store.getState>;

export default Store;
