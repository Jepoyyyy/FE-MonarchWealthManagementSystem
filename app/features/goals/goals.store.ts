import { create } from "zustand";
import { GoalApi } from '~/features/goals/api';
import type { Goal, GoalProjectionDTO } from '~/types';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
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
  }
}));