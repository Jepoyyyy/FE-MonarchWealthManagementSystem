import { api } from '~/shared/api/client';
import type { Recommendation } from '~/types';

export const RecommendationApi = {
  health: () => api.get("/api/v1/me/recommendations/health"),
  generate: () => api.post<Recommendation[]>("/api/v1/me/recommendations"),
};