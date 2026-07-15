import { create } from "zustand";
import { RecommendationApi } from "../api/recommendations";
import type { Recommendation } from "../types";

interface RecommendationsState {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: () => Promise<void>;
}

export const useRecommendationsStore = create<RecommendationsState>((set) => ({
  recommendations: [],
  loading: false,
  error: null,
  fetchRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await RecommendationApi.generate();
      set({ recommendations: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load recommendations", loading: false });
    }
  },
}));