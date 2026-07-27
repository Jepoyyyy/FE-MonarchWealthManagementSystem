import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GoalApi } from '~/features/goals/api';
import type { Goal } from '~/types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchGoals: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
  backgroundRefresh: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      loading: false,
      error: null,
      lastFetched: null,

      invalidateCache: () => set({ lastFetched: null }),

      fetchGoals: async (force = false) => {
        const { lastFetched, loading } = get();
        if (loading) return;

        const now = Date.now();
        if (!force && lastFetched && now - lastFetched < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await GoalApi.list();
          set({ goals: res.data || [], loading: false, error: null, lastFetched: Date.now() });
        } catch (err: any) {
          set({ error: err?.message || "Failed to fetch goals", loading: false });
        }
      },

      backgroundRefresh: async () => {
        try {
          const res = await GoalApi.list();
          if (res.data) {
            set({ goals: res.data, lastFetched: Date.now() });
          }
        } catch (err) {
          // Silent failure on background refresh
        }
      },
    }),
    {
      name: 'goals-storage',
      partialize: (state) => ({
        goals: state.goals,
        lastFetched: state.lastFetched,
      }),
    }
  )
);