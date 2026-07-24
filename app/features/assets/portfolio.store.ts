import { create } from "zustand";
import { AssetApi } from '~/features/assets/api';
import { GoalApi } from '~/features/goals/api';
import { useProductsStore } from '~/features/products/products.store';
import type { Asset, AssetsPnLResponse, TransactionHistory, GoalProgressResponse } from "~/types";

interface PortfolioState {
  assets: Asset[];
  pnlData: AssetsPnLResponse[];
  goalProgress: GoalProgressResponse[];
  loading: boolean;
  error: string | null;
  fetchPortfolio: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  assets: [],
  pnlData: [],
  goalProgress: [],
  loading: false,
  error: null,
  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const products = useProductsStore.getState().products;
      const results = await Promise.allSettled([
        AssetApi.list(products),
        AssetApi.fetchPnL(),
        GoalApi.fetchProgress(),
      ]);

      if (results[0].status === "rejected") {
        const err = results[0].reason;
        const msg = err instanceof Error ? err.message : (typeof err === "string" ? err : "Error loading assets");
        set({ error: msg || "Error loading assets", loading: false });
        return;
      }

      const assetsRes = results[0].value;
      const pnlRes = results[1].status === "fulfilled" ? results[1].value : { data: [] };
      const progressRes = results[2].status === "fulfilled" ? results[2].value : { data: [] };

      set({
        assets: assetsRes.data,
        pnlData: pnlRes.data,
        goalProgress: progressRes.data,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error loading assets", loading: false });
    }
  },
}));