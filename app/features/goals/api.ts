import { api } from '~/shared/api/client';
import type { Goal, GoalRegistrationDTO, GoalProjectionDTO, GoalType } from '~/types';
import { monthsToGoal } from '~/utils';
import { GOAL_TYPE_CONFIG } from './goals.config';

function toGoalPayload(data: any) {
  const target = data.targetAmount;
  const current = data.currentSaved || 0;
  const monthly = data.monthlyContribution;
  const annualReturn = data.expectedReturn || 7.5;
  
  let months = monthsToGoal(target, current, monthly, annualReturn);
  if (months < 0) {
    months = 120; // 10 years fallback
  }
  
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const targetDate = `${year}-${month}-${day}`;

  return {
    name: data.name,
    type: data.type === "car" ? "vehicle" : data.type,
    target_amount: target,
    monthly_contribution: monthly,
    target_date: targetDate,
    is_priority: data.isPriority || false,
    notes: data.notes || ""
  };
}

function fromGoalResponse(data: any): Goal {
  const typeMapped = data.type === "vehicle" ? "car" : data.type;
  return {
    id: data.id,
    name: data.name,
    type: typeMapped as GoalType,
    targetAmount: data.target_amount ?? data.targetAmount ?? 0,
    currentSaved: data.current_saved ?? data.currentSaved ?? 0,
    monthlyContribution: data.monthly_contribution ?? data.monthlyContribution ?? 0,
    expectedReturn: data.expected_return ?? data.expectedReturn ?? 7.5,
    isPriority: data.is_priority ?? data.isPriority ?? false,
    color: data.color || GOAL_TYPE_CONFIG[typeMapped as GoalType]?.color || "#10b981",
    notes: data.notes || undefined,
  };
}

function fromProjectionResponse(data: any): GoalProjectionDTO {
  return {
    goalId: data.goal_id ?? data.goalId,
    month: data.month,
    projectedValue: data.projected_value ?? data.projectedValue ?? 0,
    totalContributions: data.total_contributions ?? data.totalContributions ?? 0,
    totalReturns: data.total_returns ?? data.totalReturns ?? 0,
  };
}

export const GoalApi = {
  list: async () => {
    const res = await api.get<any[]>("/api/v1/me/goals");
    return {
      ...res,
      data: (res.data || []).map(fromGoalResponse)
    };
  },
  create: async (dto: GoalRegistrationDTO) => {
    const payload = toGoalPayload(dto);
    const res = await api.post<any>("/api/v1/me/goals", payload);
    return {
      ...res,
      data: fromGoalResponse(res.data)
    };
  },
  update: async (id: string, dto: GoalRegistrationDTO) => {
    const payload = toGoalPayload(dto);
    const res = await api.put<any>(`/api/v1/me/goals/${id}`, payload);
    return {
      ...res,
      data: fromGoalResponse(res.data)
    };
  },
  delete: (id: string) => api.delete(`/api/v1/me/goals/${id}`),
  projections: async () => {
    const res = await api.get<any[]>("/api/v1/me/goals/projections");
    return {
      ...res,
      data: (res.data || []).map(fromProjectionResponse)
    };
  },
};
