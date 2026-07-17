import type { Product } from "~/features/products/products.types";
import type { Goal } from "~/features/goals/goals.types";

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

export interface HealthComponent {
  componentName: string;
  label: string;
  score: number;
  maxScore: number;
}

export interface HealthScoreDTO {
  totalScore: number;
  maxScore: number;
  status: string;
  "portofolio-value": number;
  "available-surplus": number;
  components: HealthComponent[];
}
