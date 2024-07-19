export type Nutrition = {
    display_name: string;
    amount: number;
    unit: string;
};

export enum MqttSuccessType {
    Success = "Success",
    Error = "Error",
    Info = "Info",
}
