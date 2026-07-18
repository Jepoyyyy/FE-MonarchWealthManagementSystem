import { api } from '~/shared/api/client';
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";

function toDateArray(dateStr: string | undefined): number[] | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  return [y, m, d, 0, 0, 0];
}

function mapQty(asset: any, products: any[]) {
  const p = products.find(prod => prod.id === asset.productId);
  const units = asset.units ?? asset.quantity ?? 0;
  return p?.type === "Stock" ? units / 100 : units;
}

function toAssetPayload(data: Omit<Asset, "id">, products: any[]) {
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
  list: async (products: any[]) => {
    const res = await api.get<any[]>("/api/v1/me/assets");
    const mapped = (res.data ?? []).map((asset) => ({
      ...asset,
      quantity: mapQty(asset, products)
    }));
    return { ...res, data: mapped };
  },

  create: async (data: Omit<Asset, "id">, products: any[]) => {
    const res = await api.post<any>("/api/v1/me/assets", toAssetPayload(data, products));
    return {
      ...res,
      data: {
        ...res.data,
        quantity: mapQty(res.data, products)
      }
    };
  },

  update: async (id: string, data: Partial<Asset>, products: any[]) => {
    await api.put<any>(`/api/v1/me/assets/${id}`, { goalId: data.goalId });
    // PUT response may lack productId — GET the full resource for accurate qty mapping
    const full = await api.get<any>(`/api/v1/me/assets/${id}`);
    return {
      data: {
        ...full.data,
        quantity: mapQty(full.data, products)
      }
    };
  },

  delete: (id: string) => api.delete(`/api/v1/me/assets/${id}`),
  addTransaction: (id: string, data: { action: string, units?: number, amount?: number }) => api.post(`/api/v1/me/assets/${id}/transactions`, data),
  fetchPnL: () => api.get<AssetsPnLResponse[]>("/api/v1/me/assets/pnl"),
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
};