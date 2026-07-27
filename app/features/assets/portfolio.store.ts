import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AssetApi } from '~/features/assets/api';
import { GoalApi } from '~/features/goals/api';
import { useProductsStore } from '~/features/products/products.store';
import type { Asset, AssetsPnLResponse, GoalProgressResponse } from "~/types";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface PortfolioState {
  assets: Asset[];
  pnlData: AssetsPnLResponse[];
  goalProgress: GoalProgressResponse[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchPortfolio: (force?: boolean) => Promise<void>;
  backgroundRefresh: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      assets: [],
      pnlData: [],
      goalProgress: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchPortfolio: async (force = false) => {
        const { lastFetched, loading } = get();
        if (loading) return;

        const now = Date.now();
        if (!force && lastFetched && now - lastFetched < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const products = useProductsStore.getState().products;
          const results = await Promise.allSettled([
            AssetApi.list(products),
            AssetApi.fetchPnL(),
            GoalApi.fetchProgress(),
          ]);

          const assetsRes = results[0].status === "fulfilled" ? results[0].value : null;
          const pnlRes = results[1].status === "fulfilled" ? results[1].value : null;
          const progressRes = results[2].status === "fulfilled" ? results[2].value : null;

          const assetsData = assetsRes && Array.isArray(assetsRes.data) ? assetsRes.data : [];
          const pnlData = pnlRes && Array.isArray(pnlRes.data) ? pnlRes.data : [];
          const goalProgressData = progressRes && Array.isArray(progressRes.data) ? progressRes.data : [];

          let errorMsg: string | null = null;
          if (results[0].status === "rejected") {
            const err = results[0].reason;
            errorMsg = err instanceof Error ? err.message : (typeof err === "string" ? err : "Error loading assets");
          }

          set({
            assets: assetsData,
            pnlData: pnlData,
            goalProgress: goalProgressData,
            loading: false,
            error: errorMsg,
            lastFetched: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : "Error loading assets", loading: false });
        }
      },

      backgroundRefresh: async () => {
        try {
          const products = useProductsStore.getState().products;
          const results = await Promise.allSettled([
            AssetApi.list(products),
            AssetApi.fetchPnL(),
            GoalApi.fetchProgress(),
          ]);

          const assetsRes = results[0].status === "fulfilled" ? results[0].value : null;
          const pnlRes = results[1].status === "fulfilled" ? results[1].value : null;
          const progressRes = results[2].status === "fulfilled" ? results[2].value : null;

          const assetsData = assetsRes && Array.isArray(assetsRes.data) ? assetsRes.data : get().assets;
          const pnlData = pnlRes && Array.isArray(pnlRes.data) ? pnlRes.data : get().pnlData;
          const goalProgressData = progressRes && Array.isArray(progressRes.data) ? progressRes.data : get().goalProgress;

          set({
            assets: assetsData,
            pnlData: pnlData,
            goalProgress: goalProgressData,
            lastFetched: Date.now(),
          });
        } catch (err) {
          // Silent failure on background refresh
        }
      },
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        assets: state.assets,
        pnlData: state.pnlData,
        goalProgress: state.goalProgress,
        lastFetched: state.lastFetched,
      }),
    }
  )
);