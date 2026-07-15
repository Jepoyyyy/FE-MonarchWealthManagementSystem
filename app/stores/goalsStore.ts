import { create } from "zustand";
import { GoalApi } from "../api/goals";
import type { Goal, GoalProjectionDTO } from "../types";

interface GoalsState {
  goals: Goal[];
  projections: GoalProjectionDTO[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchProjections: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  projections: [],
  loading: false,
  error: null,
  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const res = await GoalApi.list();
      set({ goals: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  fetchProjections: async () => {
    try {
      const res = await GoalApi.projections();
      set({ projections: res.data });
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));