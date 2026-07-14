import type { AppUser, Product, Asset, AuditLog, FinancialProfile, Goal, GoalType, Recommendation, ProductType } from "~/types";

export const INIT_PRODUCTS: Product[] = [
  { id: "p1", name: "BRI Money Market Fund", issuer: "BRI Invest", type: "money_market", riskLevel: 1, annualReturn: 5.2, minInvestment: 100000, visible: true, description: "Low-risk money market fund with daily liquidity and competitive yields." },
  { id: "p2", name: "Mandiri Cash Reserve", issuer: "Mandiri Invest", type: "money_market", riskLevel: 1, annualReturn: 4.8, minInvestment: 50000, visible: true, description: "Highly liquid cash management optimized for short-term savings." },
  { id: "p3", name: "BCA Term Deposit 12M", issuer: "Bank BCA", type: "deposit", riskLevel: 2, annualReturn: 5.5, minInvestment: 5000000, visible: true, description: "12-month fixed deposit with guaranteed returns and LPS protection.", tenor: "12 months" },
  { id: "p4", name: "BNI Deposit Certificate", issuer: "Bank BNI", type: "deposit", riskLevel: 2, annualReturn: 5.0, minInvestment: 1000000, visible: true, description: "Flexible time deposit with competitive rates across multiple tenors.", tenor: "6–24 months" },
  { id: "p5", name: "FR0091 Government Bond", issuer: "Republic of Indonesia", type: "bond", riskLevel: 2, annualReturn: 6.5, minInvestment: 1000000, visible: true, description: "Sovereign bond backed by Indonesian government with semi-annual coupons.", tenor: "10 years" },
  { id: "p6", name: "TLKM Corporate Bond", issuer: "Telkom Indonesia", type: "bond", riskLevel: 3, annualReturn: 7.8, minInvestment: 5000000, visible: true, description: "Investment-grade bond from state-owned telecom giant.", tenor: "5 years" },
  { id: "p7", name: "Danareksa Mawar Balanced", issuer: "Danareksa", type: "mutual_fund", riskLevel: 3, annualReturn: 7.5, minInvestment: 100000, visible: true, description: "Balanced mutual fund combining equity and fixed income instruments." },
  { id: "p8", name: "Schroder Dana Prestasi", issuer: "Schroder Investment", type: "mutual_fund", riskLevel: 3, annualReturn: 8.2, minInvestment: 100000, visible: true, description: "Consistently top-performing equity mutual fund with strong track record." },
  { id: "p9", name: "BBCA – Bank Central Asia", issuer: "IDX", type: "stock", riskLevel: 4, annualReturn: 15.3, minInvestment: 470000, visible: true, description: "Blue-chip banking stock — Indonesia's largest private bank by market cap." },
  { id: "p10", name: "BMRI – Bank Mandiri", issuer: "IDX", type: "stock", riskLevel: 4, annualReturn: 12.8, minInvestment: 600000, visible: true, description: "BUMN banking giant with strong capital ratios and consistent dividends." },
  { id: "p11", name: "Manulife Dana Saham", issuer: "Manulife Asset Mgmt", type: "mutual_fund", riskLevel: 4, annualReturn: 12.5, minInvestment: 100000, visible: true, description: "High-growth equity mutual fund targeting large-cap IDX constituents." },
  { id: "p12", name: "GOTO – GoTo Gojek Tokopedia", issuer: "IDX", type: "stock", riskLevel: 5, annualReturn: 28.4, minInvestment: 100000, visible: true, description: "High-volatility tech stock in Indonesia's rapidly growing digital economy." },
];

export const INIT_USERS: AppUser[] = [
  { id: "admin1", name: "Admin User", email: "admin@wms.id", password: "Admin123!", role: "admin", status: "active", riskProfile: null, questionnaireCompleted: true, createdAt: "2024-01-01", totalAssets: 0 },
  { id: "u1", name: "Budi Santoso", email: "budi@example.com", password: "User123!", role: "user", status: "active", riskProfile: "moderate", questionnaireCompleted: true, createdAt: "2024-03-15", totalAssets: 47883000 },
  { id: "u2", name: "Sari Dewi", email: "sari@example.com", password: "User123!", role: "user", status: "active", riskProfile: "risk_averse", questionnaireCompleted: true, createdAt: "2024-04-20", totalAssets: 125785000 },
  { id: "u3", name: "Andi Pratama", email: "andi@example.com", password: "User123!", role: "user", status: "suspended", riskProfile: "risk_taker", questionnaireCompleted: true, createdAt: "2024-05-10", totalAssets: 28400000 },
];

export const INIT_ASSETS: Asset[] = [
  { id: "a1", userId: "u1", productId: "p7",  amount: 15000000, purchaseDate: "2024-03-20", currentValue: 1075, quantity: 13953.4884, goalId: "g2" },
  { id: "a2", userId: "u1", productId: "p3",  amount: 10000000, purchaseDate: "2024-02-01", currentValue: 10000000, quantity: 10000000, goalId: "g1", tenorMonths: 12 },
  { id: "a3", userId: "u1", productId: "p5",  amount: 20000000, purchaseDate: "2024-01-15", currentValue: 101.5, quantity: 20000000, goalId: "g3" },
  { id: "a_mock_stock", userId: "u1", productId: "p9", amount: 5000000, purchaseDate: "2026-07-01", currentValue: 5200, quantity: 10 },
  { id: "a4", userId: "u2", productId: "p1",  amount: 50000000, purchaseDate: "2024-01-10", currentValue: 1015, quantity: 49261.0837 },
  { id: "a5", userId: "u2", productId: "p3",  amount: 70000000, purchaseDate: "2024-02-15", currentValue: 70000000, quantity: 70000000 },
  { id: "a6", userId: "u3", productId: "p9",  amount: 20000000, purchaseDate: "2024-04-01", currentValue: 5490, quantity: 42 },
  { id: "a7", userId: "u3", productId: "p12", amount: 5000000,  purchaseDate: "2024-05-15", currentValue: 534, quantity: 100 },
];

export const INIT_LOGS: AuditLog[] = [
  { id: "l1", userId: "u1", userName: "Budi Santoso", action: "LOGIN", details: "Successful login from 192.168.1.100", timestamp: "2024-07-03T08:30:00", category: "auth" },
  { id: "l2", userId: "u1", userName: "Budi Santoso", action: "ADD_ASSET", details: "Added Danareksa Mawar Balanced — IDR 15,000,000", timestamp: "2024-07-03T09:15:00", category: "portfolio" },
  { id: "l3", userId: "admin1", userName: "Admin User", action: "HIDE_PRODUCT", details: "Product 'GOTO – GoTo Gojek Tokopedia' set to hidden", timestamp: "2024-07-03T10:00:00", category: "admin" },
  { id: "l4", userId: "u2", userName: "Sari Dewi", action: "QUESTIONNAIRE_COMPLETE", details: "Risk profile set to Risk Averse (score: 2/10)", timestamp: "2024-07-02T14:20:00", category: "questionnaire" },
  { id: "l5", userId: "admin1", userName: "Admin User", action: "SUSPEND_USER", details: "User 'Andi Pratama' status changed to Suspended", timestamp: "2024-07-02T11:30:00", category: "admin" },
  { id: "l6", userId: "u3", userName: "Andi Pratama", action: "LOGIN_FAILED", details: "Login blocked — account is suspended", timestamp: "2024-07-02T16:00:00", category: "auth" },
  { id: "l7", userId: "u2", userName: "Sari Dewi", action: "ADD_ASSET", details: "Added BRI Money Market Fund — IDR 50,000,000", timestamp: "2024-07-01T11:00:00", category: "portfolio" },
  { id: "l8", userId: "admin1", userName: "Admin User", action: "SHOW_PRODUCT", details: "Product 'FR0091 Government Bond' set to visible", timestamp: "2024-07-01T09:00:00", category: "admin" },
];

export const QUESTIONNAIRE = [
  { id: 1, question: "What is your primary investment goal?", options: [
    { label: "Protect my capital — I cannot afford to lose money", score: 0 },
    { label: "Balance growth with moderate security", score: 1 },
    { label: "Maximize returns — I accept high risk for high reward", score: 2 },
  ]},
  { id: 2, question: "How long do you plan to hold your investments?", options: [
    { label: "Less than 1 year — I need liquidity soon", score: 0 },
    { label: "1 to 5 years — medium-term financial goals", score: 1 },
    { label: "More than 5 years — building long-term wealth", score: 2 },
  ]},
  { id: 3, question: "If your portfolio dropped 20% in a month, you would:", options: [
    { label: "Sell everything to stop further losses", score: 0 },
    { label: "Hold position and wait for recovery", score: 1 },
    { label: "Buy more — it is a buying opportunity", score: 2 },
  ]},
  { id: 4, question: "What portion of monthly income are you willing to invest?", options: [
    { label: "Less than 10% — only comfortable surplus", score: 0 },
    { label: "10% to 30% — disciplined regular investing", score: 1 },
    { label: "More than 30% — committed to aggressive wealth building", score: 2 },
  ]},
  { id: 5, question: "How would you describe your investment experience?", options: [
    { label: "No experience — this is my first time investing", score: 0 },
    { label: "Some experience with deposits or mutual funds", score: 1 },
    { label: "Experienced with stocks, bonds, and market cycles", score: 2 },
  ]},
];

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

export const INIT_FIN_PROFILE: FinancialProfile = {
  monthlyIncome: 15000000,
  expenses: {
    housing: 3000000,
    food: 2000000,
    transport: 1000000,
    utilities: 500000,
    healthcare: 300000,
    entertainment: 800000,
    insurance: 400000,
    other: 500000,
  },
};

export const INIT_GOALS: Goal[] = [
  {
    id: "g1", name: "Emergency Fund", type: "savings",
    targetAmount: 54000000, currentSaved: 15000000,
    monthlyContribution: 1500000, expectedReturn: 5.0,
    isPriority: true, color: "#10b981",
    notes: "Target: 6 months of monthly expenses",
  },
  {
    id: "g2", name: "Bali Family Trip 2025", type: "vacation",
    targetAmount: 22000000, currentSaved: 5000000,
    monthlyContribution: 1000000, expectedReturn: 5.2,
    isPriority: false, color: "#6366f1",
  },
  {
    id: "g3", name: "Retire at 55", type: "retirement",
    targetAmount: 3000000000, currentSaved: 47000000,
    monthlyContribution: 3000000, expectedReturn: 8.0,
    isPriority: false, color: "#8b5cf6",
    notes: "Based on 25× annual expenses rule",
  },
];

export const EXPENSE_LABELS: Record<string, string> = {
  housing: "Housing / Rent",
  food: "Food & Groceries",
  transport: "Transport",
  utilities: "Utilities",
  healthcare: "Healthcare",
  entertainment: "Entertainment",
  insurance: "Insurance",
  other: "Other",
};

export const PRIORITY_CONFIG = {
  high:   { label: "High priority",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  medium: { label: "Medium priority", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)" },
  low:    { label: "Opportunity",     color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)" },
};

// Seed market prices for prototype — replaces live API data
export const PRODUCT_SEED_PRICES: Record<string, number> = {
  p1: 1015, p2: 1008, p3: 0, p4: 0,
  p5: 101.5, p6: 98.2,
  p7: 1075, p8: 1250, p11: 985,
  p9: 5490, p10: 3120, p12: 534,
};

export const depositTenors = [
  { months: 1, label: "1 Month", return: 4.0 },
  { months: 3, label: "3 Months", return: 4.5 },
  { months: 12, label: "12 Months", return: 5.5 },
];
