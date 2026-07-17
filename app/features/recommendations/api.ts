import { api } from '~/shared/api/client';
import type { Recommendation, HealthScoreDTO } from './recommendations.types';

export const RecommendationApi = {
  health: () => api.get<HealthScoreDTO>("/api/v1/me/health"),
  generate: () => api.post<Recommendation[]>("/api/v1/me/recommendations"),
};
