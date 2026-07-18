import { create } from "zustand";
import { AssetApi } from '~/features/assets/api';
import { useProductsStore } from '~/features/products/products.store';
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";

interface PortfolioState {
  assets: Asset[];
  pnlData: AssetsPnLResponse[];
  logs: TransactionHistory[];
  loading: boolean;
  error: string | null;
  fetchPortfolio: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  assets: [],
  pnlData: [],
  logs: [],
  loading: false,
  error: null,
  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const products = useProductsStore.getState().products;
      const [assetsRes, pnlRes, logsRes] = await Promise.all([
        AssetApi.list(products),
        AssetApi.fetchPnL(),
        AssetApi.fetchLogs(),
      ]);
      set({
        assets: assetsRes.data,
        pnlData: pnlRes.data,
        logs: logsRes.data,
        loading: false,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to load portfolio", loading: false });
    }
  },
}));