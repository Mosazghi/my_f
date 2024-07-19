import { RefrigeratorItem } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Items = RefrigeratorItem[];

interface ItemsState {
    allItems: Items;
    todaysItems: Items;
    expiredItems: Items;
}

const initialState: ItemsState = {
    allItems: [],
    todaysItems: [],
    expiredItems: [],
};

const ItemsSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        setAllItems(state, action: PayloadAction<Items>) {
            state.allItems = action.payload;
        },
        setTodaysItems(state, action: PayloadAction<Items>) {
            state.todaysItems = action.payload;
        },
        setExpiredItems(state, action: PayloadAction<Items>) {
            state.expiredItems = action.payload;
        },
    },
});

export const { setAllItems, setTodaysItems, setExpiredItems } = ItemsSlice.actions;

export default ItemsSlice.reducer;
