import { Nutrition, MqttSuccessType } from "./types";

export interface RefrigeratorItem {
    barcode: string;
    name: string;
    expiration_date: Date;
    quantity: number;
    nutrition: Nutrition[];
    weight?: string;
    created_at: Date;
    image_url?: string;
}

export interface NewScanMessage {
    message: string;
    success_type: MqttSuccessType;
}
