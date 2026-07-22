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
      const [assetsRes, pnlRes, progressRes] = await Promise.all([
        AssetApi.list(products),
        AssetApi.fetchPnL(),
        GoalApi.fetchProgress(),
      ]);
      set({
        assets: assetsRes.data,
        pnlData: pnlRes.data,
        goalProgress: progressRes.data,
        loading: false,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to load portfolio", loading: false });
    }
  },
}));