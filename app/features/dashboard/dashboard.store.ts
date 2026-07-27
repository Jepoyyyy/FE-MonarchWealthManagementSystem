import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardApi } from '~/features/dashboard/api';
import type { UserDashboardDTO } from '~/types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface DashboardState {
  dashData: UserDashboardDTO | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchDashboard: (force?: boolean) => Promise<void>;
  backgroundRefresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      dashData: null,
      loading: false,
      error: null,
      lastFetched: null,

      fetchDashboard: async (force = false) => {
        const { lastFetched, loading } = get();
        if (loading) return;

        const now = Date.now();
        if (!force && lastFetched && now - lastFetched < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await DashboardApi.getUserDashboard();
          set({
            dashData: res.data,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (err: any) {
          const msg = err?.message || "Failed to load dashboard";
          set({ error: msg, loading: false });
        }
      },

      backgroundRefresh: async () => {
        try {
          const res = await DashboardApi.getUserDashboard();
          if (res.data) {
            set({ dashData: res.data, lastFetched: Date.now() });
          }
        } catch (err) {
          // Silent failure on background refresh
        }
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        dashData: state.dashData,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
