import { api } from "./client";
import type { Goal, GoalRegistrationDTO, GoalProjectionDTO } from "../types";

export const GoalApi = {
  list: () => api.get<Goal[]>("/api/v1/me/goals"),
  create: (dto: GoalRegistrationDTO) => api.post<Goal>("/api/v1/me/goals", dto),
  update: (id: string, dto: GoalRegistrationDTO) => api.put<Goal>(`/api/v1/me/goals/${id}`, dto),
  delete: (id: string) => api.delete(`/api/v1/me/goals/${id}`),
  projections: () => api.get<GoalProjectionDTO[]>("/api/v1/me/goals/projections"),
};