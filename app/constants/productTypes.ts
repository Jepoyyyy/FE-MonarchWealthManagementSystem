import type { ProductType } from "~/types";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  money_market: "Money Market",
  deposit: "Deposit",
  bond: "Bond",
  mutual_fund: "Mutual Fund",
  stock: "Stock",
};

export const PRODUCT_TYPE_OPTIONS: Array<{ id: ProductType | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "money_market", label: PRODUCT_TYPE_LABELS.money_market },
  { id: "deposit", label: PRODUCT_TYPE_LABELS.deposit },
  { id: "bond", label: PRODUCT_TYPE_LABELS.bond },
  { id: "mutual_fund", label: PRODUCT_TYPE_LABELS.mutual_fund },
  { id: "stock", label: PRODUCT_TYPE_LABELS.stock },
];

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  money_market: "💰",
  deposit: "🏦",
  bond: "📜",
  mutual_fund: "📈",
  stock: "📊",
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
