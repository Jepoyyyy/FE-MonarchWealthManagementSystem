import { api } from "./client";
import type { Recommendation } from "../types";

export const RecommendationApi = {
  health: () => api.get("/api/v1/recommendations/health"),
  generate: () => api.post<Recommendation[]>("/api/v1/recommendations"),
};