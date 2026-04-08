import type { backendInterface } from "../backend";
import { Category } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const weekAgo = now - BigInt(7 * 24 * 60 * 60 * 1_000_000_000);

let spendingLimit: number | null = 100;

const currentWeekTxns = [
  {
    id: BigInt(1),
    description: "Grocery run",
    timestamp: now - BigInt(2 * 60 * 60 * 1_000_000_000),
    category: Category.Food,
    amount: 24.5,
  },
  {
    id: BigInt(2),
    description: "Movie tickets",
    timestamp: now - BigInt(5 * 60 * 60 * 1_000_000_000),
    category: Category.Recreational,
    amount: 18.0,
  },
  {
    id: BigInt(3),
    description: "Electric bill",
    timestamp: now - BigInt(24 * 60 * 60 * 1_000_000_000),
    category: Category.Utility,
    amount: 15.75,
  },
  {
    id: BigInt(4),
    description: "Coffee shop",
    timestamp: now - BigInt(26 * 60 * 60 * 1_000_000_000),
    category: Category.Food,
    amount: 8.0,
  },
  {
    id: BigInt(5),
    description: "Mini golf",
    timestamp: now - BigInt(48 * 60 * 60 * 1_000_000_000),
    category: Category.Recreational,
    amount: 12.0,
  },
  {
    id: BigInt(6),
    description: "Lunch",
    timestamp: now - BigInt(50 * 60 * 60 * 1_000_000_000),
    category: Category.Food,
    amount: 6.0,
  },
];

export const mockBackend: backendInterface = {
  addTransaction: async (amount, description, category) => ({
    id: BigInt(99),
    description,
    timestamp: now,
    category,
    amount,
  }),

  checkAndResetWeek: async () => false,

  getCurrentWeekSummary: async () => ({
    weekId: BigInt(1),
    startDate: weekAgo,
    endDate: now,
    foodTotal: 38.5,
    recTotal: 22.0,
    utilTotal: 15.75,
    grandTotal: 76.25,
  }),

  getCurrentWeekTransactions: async () => [...currentWeekTxns],

  getTodayTransactions: async () => [
    {
      id: BigInt(1),
      description: "Grocery run",
      timestamp: now - BigInt(2 * 60 * 60 * 1_000_000_000),
      category: Category.Food,
      amount: 24.5,
    },
  ],

  getWeekHistory: async () => [
    {
      weekId: BigInt(0),
      startDate: weekAgo - BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
      endDate: weekAgo,
      foodTotal: 52.0,
      recTotal: 30.0,
      utilTotal: 20.0,
      grandTotal: 102.0,
    },
    {
      weekId: BigInt(1),
      startDate: weekAgo,
      endDate: now,
      foodTotal: 38.5,
      recTotal: 22.0,
      utilTotal: 15.75,
      grandTotal: 76.25,
    },
  ],

  getWeekTransactions: async (_weekId) => [
    {
      id: BigInt(10),
      description: "Supermarket",
      timestamp: weekAgo + BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
      category: Category.Food,
      amount: 52.0,
    },
    {
      id: BigInt(11),
      description: "Cinema",
      timestamp: weekAgo + BigInt(2 * 24 * 60 * 60 * 1_000_000_000),
      category: Category.Recreational,
      amount: 30.0,
    },
    {
      id: BigInt(12),
      description: "Internet bill",
      timestamp: weekAgo + BigInt(3 * 24 * 60 * 60 * 1_000_000_000),
      category: Category.Utility,
      amount: 20.0,
    },
  ],

  getSpendingLimit: async () => spendingLimit,

  setSpendingLimit: async (limit) => {
    spendingLimit = limit;
  },

  updateTransaction: async (id, amount, description, category) => {
    const idx = currentWeekTxns.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    currentWeekTxns[idx] = { ...currentWeekTxns[idx], amount, description, category };
    return currentWeekTxns[idx];
  },

  deleteTransaction: async (id) => {
    const idx = currentWeekTxns.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    currentWeekTxns.splice(idx, 1);
    return true;
  },

  getExportData: async () =>
    currentWeekTxns.map((t) => [
      t.timestamp,
      t.amount,
      t.category,
      t.description,
    ] as [bigint, number, Category, string]),
};
