import type { ProductType } from "~/types";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  "Money Market": "Money Market",
  "Deposit": "Deposit",
  "Bond": "Bond",
  "Mutual Fund": "Mutual Fund",
  "Stock": "Stock",
  "Balanced Fund": "Balanced Fund",
  "Sukuk": "Sukuk",
};

export const PRODUCT_TYPE_OPTIONS: Array<{ id: ProductType | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "Money Market", label: PRODUCT_TYPE_LABELS["Money Market"] },
  { id: "Deposit", label: PRODUCT_TYPE_LABELS.Deposit },
  { id: "Bond", label: PRODUCT_TYPE_LABELS.Bond },
  { id: "Mutual Fund", label: PRODUCT_TYPE_LABELS["Mutual Fund"] },
  { id: "Stock", label: PRODUCT_TYPE_LABELS.Stock },
  { id: "Balanced Fund", label: PRODUCT_TYPE_LABELS["Balanced Fund"] },
  { id: "Sukuk", label: PRODUCT_TYPE_LABELS.Sukuk },
];

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  "Money Market": "💰",
  "Deposit": "🏦",
  "Bond": "📜",
  "Mutual Fund": "📈",
  "Stock": "📊",
  "Balanced Fund": "⚖️",
  "Sukuk": "🕌",
};

export const RISK_LEVEL_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

export const RISK_LEVEL_BADGE_CLASSES: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  2: "bg-green-100 text-green-700 border-green-200",
  3: "bg-amber-100 text-amber-700 border-amber-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  5: "bg-red-100 text-red-700 border-red-200",
};
