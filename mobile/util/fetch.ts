import { RefrigeratorItem } from "@/redux/mqtt";

type ApiResponse = {
    success: boolean;
    message: string;
    items: RefrigeratorItem[];
};

export async function fetchItems(): Promise<ApiResponse | undefined> {
    try {
        const response = await fetch("http://192.168.1.168:3000/api/items");

        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }

        return response.json();
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
