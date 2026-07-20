export type GoalType = "savings" | "vacation" | "car" | "property" | "retirement" | "custom";

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentSaved: number;
  monthlyContribution: number;
  isPriority: boolean;
  color: string;
  notes?: string;
}

export type GoalStatus = "reached" | "no_contribution" | "ahead" | "on_track" | "too_little";

export interface GoalAnalysis {
  status: GoalStatus;
  months: number; 
  headline: string;
  detail: string;
  suggestedMonthly?: number; 
}

export interface GoalRegistrationDTO {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentSaved: number;
  monthlyContribution: number;
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

export interface GoalProgressResponse {
  goal_id: string;
  goal_name: string;
  goal_type: string;
  target_amount: number;
  current_saved: number;
  monthly_contribution: number;
  assigned_assets_count: number;
  total_potential_pnl: number;
  total_potential_pnl_percent: number;
  avg_monthly_growth: number;
  projected_eta_months: number;
  is_priority: boolean;
}
