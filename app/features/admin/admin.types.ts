import type { UserRole, UserStatus, RiskProfile } from "~/types";

export interface AuditLog {
  id: string; 
  userId: string; 
  userName: string;
  action: string; 
  details: string; 
  timestamp: string;
  category: "auth" | "portfolio" | "admin" | "questionnaire";
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  riskProfile: RiskProfile | null;
  questionnaireCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardDTO {
  aum: number;
  user_count: number;
  active_user_count: number;
  product_count: number;
  active_product_count: number;
  total_audit_events: number;
  risk_profiles: {
    risk_averse: number;
    moderate: number;
    risk_taker: number;
  };
  aum_trend: { month: number; value: number }[];
}

export interface AdminProductCreateDTO {
  code: string;
  name: string;
  issuer: string;
  type: string;
  riskLevel: number;
  annualReturn: number;
  minInvestment: number;
  currentPrice: number;
  description: string;
  tenor?: string;
  lotSize: number;
  isFractionalAllowed: boolean;
  visible: boolean;
}

export interface AdminProductUpdateDTO {
  name?: string;
  issuer?: string;
  type?: string;
  riskLevel?: number;
  annualReturn?: number;
  minInvestment?: number;
  currentPrice?: number;
  description?: string;
  tenor?: string;
  lotSize?: number;
  isFractionalAllowed?: boolean;
  visible?: boolean;
}
