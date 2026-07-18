import { api } from '~/shared/api/client';
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";
import { useProductsStore } from '~/features/products/products.store';

function toDateArray(dateStr: string | undefined): number[] | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  return [y, m, d, 0, 0, 0];
}

function toAssetPayload(data: Omit<Asset, "id">) {
  const products = useProductsStore.getState().products;
  const p = products.find(prod => prod.id === data.productId);
  const isStock = p?.type === "Stock";
  const units = isStock && data.quantity ? data.quantity * 100 : data.quantity;

  return {
    product_id: data.productId,
    amount: data.amount,
    purchase_date: toDateArray(data.purchaseDate),
    current_value: data.currentValue,
    units: units,
    goal_id: data.goalId,
    tenor_months: data.tenorMonths,
    platform: data.platform,
    notes: data.notes,
  };
}

export const AssetApi = {
  list: async () => {
    const res = await api.get<any[]>("/api/v1/me/assets");
    const products = useProductsStore.getState().products;
    const mapped = res.data.map((asset) => {
      const p = products.find(prod => prod.id === asset.productId);
      const units = asset.units ?? asset.quantity ?? 0;
      const qty = p?.type === "Stock" ? units / 100 : units;
      return {
        ...asset,
        quantity: qty
      };
    });
    return { ...res, data: mapped };
  },

  create: async (data: Omit<Asset, "id">) => {
    const res = await api.post<any>("/api/v1/me/assets", toAssetPayload(data));
    const products = useProductsStore.getState().products;
    const asset = res.data;
    const p = products.find(prod => prod.id === asset.productId);
    const units = asset.units ?? asset.quantity ?? 0;
    const qty = p?.type === "Stock" ? units / 100 : units;
    return {
      ...res,
      data: {
        ...asset,
        quantity: qty
      }
    };
  },

  update: async (id: string, data: Partial<Asset>) => {
    const res = await api.put<any>(`/api/v1/me/assets/${id}`, { goalId: data.goalId });
    const products = useProductsStore.getState().products;
    const asset = res.data;
    const p = products.find(prod => prod.id === asset.productId);
    const units = asset.units ?? asset.quantity ?? 0;
    const qty = p?.type === "Stock" ? units / 100 : units;
    return {
      ...res,
      data: {
        ...asset,
        quantity: qty
      }
    };
  },

  delete: (id: string) => api.delete(`/api/v1/me/assets/${id}`),
  addTransaction: (id: string, data: { type: string, quantity: number, price: number }) => api.post(`/api/v1/me/assets/${id}/transactions`, data),
  fetchPnL: () => api.get<AssetsPnLResponse[]>("/api/v1/me/assets/pnl"),
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
};