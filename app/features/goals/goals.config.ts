import type { GoalType, ProductType } from "~/types";

export const GOAL_TYPE_CONFIG: Record<GoalType, { label: string; icon: string; color: string; defaultReturn: number; defaultTarget: number; description: string }> = {
  savings:    { label: "Emergency Fund",  icon: "🛡️", color: "#10b981", defaultReturn: 5.0, defaultTarget: 50000000,    description: "3–6 months of expenses as a safety net" },
  vacation:   { label: "Vacation",        icon: "✈️", color: "#6366f1", defaultReturn: 5.2, defaultTarget: 20000000,    description: "Travel & leisure fund" },
  car:        { label: "Car Purchase",    icon: "🚗", color: "#f59e0b", defaultReturn: 6.0, defaultTarget: 300000000,   description: "Vehicle purchase or down payment" },
  property:   { label: "Property",        icon: "🏠", color: "#ef4444", defaultReturn: 7.0, defaultTarget: 1500000000,  description: "Home purchase or down payment" },
  retirement: { label: "Retirement",      icon: "☀️", color: "#8b5cf6", defaultReturn: 8.0, defaultTarget: 3000000000, description: "Long-term retirement corpus" },
  custom:     { label: "Custom Goal",     icon: "🎯", color: "#64748b", defaultReturn: 7.0, defaultTarget: 100000000,  description: "Define your own financial milestone" },
};

// Max months before a goal is considered "saving too little"
export const GOAL_MAX_MONTHS: Record<GoalType, number> = {
  savings:    18,
  vacation:   12,
  car:        48,
  property:   120,
  retirement: 420,
  custom:     60,
};

// Months at which goal is considered "ahead of schedule"
export const GOAL_FAST_MONTHS: Record<GoalType, number> = {
  savings:    6,
  vacation:   3,
  car:        12,
  property:   24,
  retirement: 120,
  custom:     12,
};

export const GOAL_PRODUCT_TYPES: Record<GoalType, ProductType[]> = {
  savings:    ["money_market", "deposit"],
  vacation:   ["money_market", "deposit"],
  car:        ["deposit", "bond"],
  property:   ["bond", "mutual_fund"],
  retirement: ["mutual_fund", "stock"],
  custom:     ["deposit", "bond", "mutual_fund"],
};