import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface WeekRecord {
    recTotal: number;
    endDate: bigint;
    utilTotal: number;
    grandTotal: number;
    foodTotal: number;
    startDate: bigint;
    weekId: bigint;
}
export interface WeekSummary {
    recTotal: number;
    endDate: bigint;
    utilTotal: number;
    grandTotal: number;
    foodTotal: number;
    startDate: bigint;
    weekId: bigint;
}
export interface Transaction {
    id: bigint;
    description: string;
    timestamp: bigint;
    category: Category;
    amount: number;
}
export enum Category {
    Food = "Food",
    Recreational = "Recreational",
    Utility = "Utility"
}
export interface backendInterface {
    addTransaction(amount: number, description: string, category: Category): Promise<Transaction>;
    checkAndResetWeek(): Promise<boolean>;
    deleteTransaction(id: bigint): Promise<boolean>;
    getCurrentWeekSummary(): Promise<WeekSummary>;
    getCurrentWeekTransactions(): Promise<Array<Transaction>>;
    getExportData(): Promise<Array<[Timestamp, number, Category, string]>>;
    getSpendingLimit(): Promise<number | null>;
    getTodayTransactions(): Promise<Array<Transaction>>;
    getWeekHistory(): Promise<Array<WeekRecord>>;
    getWeekTransactions(weekId: bigint): Promise<Array<Transaction>>;
    setSpendingLimit(limit: number): Promise<void>;
    updateTransaction(id: bigint, amount: number, description: string, category: Category): Promise<Transaction | null>;
}
