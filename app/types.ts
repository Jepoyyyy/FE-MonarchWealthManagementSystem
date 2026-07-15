export type RiskProfile = "risk_averse" | "moderate" | "risk_taker";
export type ProductType = "money_market" | "deposit" | "bond" | "mutual_fund" | "stock";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export type View =
  | "login" | "register" | "questionnaire"
  | "dashboard" | "products" | "assets" | "goals" | "recommendations" | "progress"
  | "admin-dashboard" | "admin-products" | "admin-users" | "admin-audit";

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: "emergency" | "goal" | "growth" | "diversification" | "rebalance" | "surplus";
  title: string;
  reason: string;
  product?: Product;
  suggestedAmount?: number;
  goal?: Goal;
}

export interface HealthScore {
  total: number;
  emergency: number;
  diversification: number;
  goalCoverage: number;
  riskAlignment: number;
}

export type GoalType = "savings" | "vacation" | "car" | "property" | "retirement" | "custom";

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentSaved: number;
  monthlyContribution: number;
  expectedReturn: number;
  isPriority: boolean;
  color: string;
  notes?: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  expenses: {
    housing: number;
    food: number;
    transport: number;
    utilities: number;
    healthcare: number;
    entertainment: number;
    insurance: number;
    other: number;
    [key: string]: number; // Allow dynamic access by string keys
  };
}

export interface AppUser {
  id: string;
  name: string; 
  email: string; 
  password: string;
  role: UserRole; 
  status: UserStatus;
  riskProfile: RiskProfile | null; 
  questionnaireCompleted: boolean;
  createdAt: string; 
  totalAssets: number;
}

export interface Product {
  id: string; 
  name: string; 
  issuer: string; 
  type: ProductType;
  riskLevel: number; 
  annualReturn: number; 
  minInvestment: number;
  visible: boolean; 
  description: string; 
  tenor?: string;
}

export interface Asset {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  purchaseDate: string;
  currentValue: number;
  quantity?: number;
  platform?: string;
  notes?: string;
  goalId?: string;
  tenorMonths?: number;
}

export interface AuditLog {
  id: string; 
  userId: string; 
  userName: string;
  action: string; 
  details: string; 
  timestamp: string;
  category: "auth" | "portfolio" | "admin" | "questionnaire";
}

export type GoalStatus = "reached" | "no_contribution" | "ahead" | "on_track" | "too_little";

export interface GoalAnalysis {
  status: GoalStatus;
  months: number; // actual months to goal
  headline: string;
  detail: string;
  suggestedMonthly?: number; // only when too_little
}

export interface AssetsPnLResponse {
  assetId: string;
  productId: string;
  productName: string;
  productType: string;
  units: number;
  currentValue: number;
  avgPrice: number;
  potentialPnl: number;
  potentialPnlPercent: number;
  realizedPnl: number;
  realizedPnlPercent: number;
}

export interface TransactionHistory {
  id: string;
  assetId: string;
  action: "BUY" | "SELL";
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  transactionDate: string;
}

export interface AssetRegistrationDTO {
  productId: string;
  units: number;
}

export interface GoalSettingDTO {
  // Define fields if any are known, or leave as any/partial
}

export interface GoalRegistrationDTO {
  name: string;
  type: string;
  targetAmount: number;
  currentSaved: number;
  monthlyContribution: number;
  expectedReturn: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  isPriority: boolean;
  color: string;
}

export interface GoalProjectionDTO {
  goalId: string;
  month: number;
  projectedValue: number;
  totalContributions: number;
  totalReturns: number;
}

export interface UserDashboardDTO {
  performance: { month: number; value: number }[];
  portofolio: {
    value: number | string;
    invested: number | string;
    holdings: number;
    items: { name: string; value: number; color?: string }[];
  };
}

export interface AdminDashboardDTO {
  // define if needed based on plan
}
