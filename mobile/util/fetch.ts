import { setAllItems, setExpiredItems, setTodaysItems } from "@/redux/items";
import Store from "@/redux/store";
import { RefrigeratorItem } from "@/interfaces";
import Toast from "react-native-toast-message";
const API_URL = "http://192.168.1.168:80";

interface RequestProps {
    url: string;
    method: string | "GET" | "POST" | "DELETE" | "PATCH";
    data?: Record<string, any>;
    headers?: Record<string, string>;
}

export async function request({ url, method, data, headers }: RequestProps) {
    const defaultHeaders = {
        "Content-Type": "application/json",
    };
    console.info("Requesting: ", url, method, data, headers);

    try {
        const response = await fetch(url, {
            method,
            body: data ? JSON.stringify(data) : undefined,
            headers: { ...defaultHeaders, ...headers },
        });
        const res_json = await response.json();
        if (response.ok) {
            if (method === "DELETE") {
                return true;
            } else {
                return res_json;
            }
        } else {
            const errorData = res_json;
            throw new Error(errorData.message || `Failed to ${method} data`);
        }
    } catch (e: any) {
        Toast.show({
            type: "error",
            text1: e.message,
        });
        console.error(e);
        return e;
    }
}

export async function fetchItems() {
    const response = await request({
        url: API_URL + "/api/items",
        method: "GET",
    });

    if (response === undefined || response.success === false) {
        console.error("Failed to fetch items");
        return;
    }
    Store.dispatch(setAllItems(response.items));

    let tempTodaysItems: RefrigeratorItem[] = [];
    let tempExpiredItems: RefrigeratorItem[] = [];

    response.items.filter((item: RefrigeratorItem) => {
        const todayDate = new Date();
        const itemDate = new Date(item.expiration_date); // WARNING: Debug purposes only

        if (
            todayDate.getDate() === itemDate.getDate() &&
            todayDate.getMonth() === itemDate.getMonth() &&
            todayDate.getFullYear() === itemDate.getFullYear()
        ) {
            tempTodaysItems.push(item);
        }

        if (todayDate >= itemDate) tempExpiredItems.push(item);
    });

    Store.dispatch(setTodaysItems(tempTodaysItems));
    Store.dispatch(setExpiredItems(tempExpiredItems));
}

export async function updateItem(barcode: string, data: Record<string, any>) {
    const response = await request({
        url: API_URL + `/api/items/${barcode}`,
        method: "PATCH",
        data,
    });

    if (response.success === true) {
        Toast.show({
            type: "success",
            text1: response.message,
        });
    }
}

export async function deleteItem(barcode: string) {
    const response = await request({
        url: API_URL + `/api/items/${barcode}`,
        method: "DELETE",
    });

    if (response.success === true) {
        Toast.show({
            type: "success",
            text1: response.message,
        });
    }
}
