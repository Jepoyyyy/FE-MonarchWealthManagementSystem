export type RiskProfile = "risk_averse" | "moderate" | "risk_taker";
export type ProductType = "Money Market" | "Deposit" | "Bond" | "Mutual Fund" | "Stock" | "Balanced Fund" | "Sukuk";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export type View =
  | "login" | "register" | "questionnaire"
  | "dashboard" | "products" | "assets" | "goals" | "recommendations" | "progress"
  | "admin-dashboard" | "admin-products" | "admin-users" | "admin-audit";

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
