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
