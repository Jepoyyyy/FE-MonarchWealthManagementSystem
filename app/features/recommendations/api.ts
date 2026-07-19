import { api } from '~/shared/api/client';
import type { Recommendation, HealthScoreDTO } from './recommendations.types';
import type { Product } from '~/features/products/products.types';
import type { Goal, GoalType } from '~/features/goals/goals.types';

function fromRecommendationResponse(data: any): Recommendation {
  let mappedGoal: Goal | undefined = undefined;
  if (data.goal) {
    const typeMapped = data.goal.type === "vehicle" ? "car" : data.goal.type;
    mappedGoal = {
      id: data.goal.id,
      name: data.goal.name,
      type: typeMapped as GoalType,
      targetAmount: data.goal.target_amount ?? 0,
      currentSaved: data.goal.current_amount ?? 0,
      monthlyContribution: data.goal.monthly_contribution ?? 0,
      isPriority: data.goal.is_priority ?? false,
      color: data.goal.color || "#10b981",
      notes: data.goal.notes || undefined,
    };
  }

  return {
    id: data.id,
    priority: data.priority,
    category: data.category,
    title: data.title,
    reason: data.reason,
    product: data.product as Product | undefined,
    suggestedAmount: data.suggested_amount ?? undefined,
    goal: mappedGoal,
  };
}

export const RecommendationApi = {
  health: () => api.get<HealthScoreDTO>("/api/v1/me/health"),
  generate: async () => {
    const res = await api.post<any[]>("/api/v1/me/recommendations");
    return {
      ...res,
      data: (res.data || []).map(fromRecommendationResponse),
    };
  },
};
