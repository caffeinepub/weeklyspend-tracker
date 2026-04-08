export type Category = "Food" | "Recreational" | "Utility";

export interface Transaction {
  id: bigint;
  amount: number;
  description: string;
  category: Category;
  timestamp: bigint;
}

export interface WeekSummary {
  weekId: bigint;
  startDate: bigint;
  endDate: bigint;
  foodTotal: number;
  recTotal: number;
  utilTotal: number;
  grandTotal: number;
}

export interface WeekRecord {
  weekId: bigint;
  startDate: bigint;
  endDate: bigint;
  foodTotal: number;
  recTotal: number;
  utilTotal: number;
  grandTotal: number;
}

export type ExportRow = [bigint, number, string, string]; // [timestamp, amount, categoryLabel, description]

export function getCategoryLabel(cat: Category): string {
  return cat;
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export function formatDateRange(startMs: number, endMs: number): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = new Date(startMs)
    .toLocaleDateString("en-US", opts)
    .toUpperCase();
  const end = new Date(endMs).toLocaleDateString("en-US", opts).toUpperCase();
  return `${start} – ${end}`;
}
