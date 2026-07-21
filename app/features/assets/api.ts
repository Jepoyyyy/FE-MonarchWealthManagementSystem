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
  // Use actual product lot size instead of hardcoded 100
  const lotSize = p?.lotSize || 1;
  return p?.type === "Stock" ? units / lotSize : units;
}

function toAssetPayload(data: Omit<Asset, "id">, products: any[]) {
  const p = products.find(prod => prod.id === data.productId);
  const isStock = p?.type === "Stock";
  // Use actual product lot size instead of hardcoded 100
  const lotSize = p?.lotSize || 1;
  const units = isStock && data.quantity ? data.quantity * lotSize : data.quantity;
  return {
    product_id: data.productId,
    amount: data.amount,
    purchase_date: toDateArray(data.purchaseDate),
    // Remove current_value - backend calculates this (units × current_price)
    units: units,
    goal_id: data.goalId,
    tenor: data.tenorMonths,
    platform: data.platform,
    notes: data.notes,
  };
}

function mapAsset(asset: any, products: any[]): Asset {
  const rawType = asset.type;
  const normalizedType = (rawType === "deposit" || rawType === "Deposit") ? "Bank Deposit" : rawType;
  const camel = {
    id: asset.id,
    userId: asset.user_id,
    productId: asset.product_id,
    goalId: asset.goal_id,
    amount: asset.amount,
    units: asset.units,
    currentValue: asset.current_value,
    platform: asset.platform,
    notes: asset.notes,
    purchaseDate: (asset.purchase_date ?? "").split(" ")[0],
    updatedAt: asset.updated_at,
    name: asset.name,
    issuer: asset.issuer,
    type: normalizedType,
  };
  return {
    ...camel,
    quantity: mapQty(camel, products),
  } as Asset;
}

export const AssetApi = {
  list: async (products: any[]) => {
    const res = await api.get<any[]>("/api/v1/me/assets");
    const mapped = (res.data ?? []).map((asset) => mapAsset(asset, products));
    return { ...res, data: mapped };
  },

  create: async (data: Omit<Asset, "id">, products: any[]) => {
    const res = await api.post<any>("/api/v1/me/assets", toAssetPayload(data, products));
    return {
      ...res,
      data: mapAsset(res.data, products),
    };
  },

  update: async (id: string, data: Partial<Asset>, products: any[]) => {
    const res = await api.put<any>(`/api/v1/me/assets/${id}`, { goalId: data.goalId });
    return {
      data: mapAsset(res.data, products),
    };
  },

  delete: (id: string) => api.delete(`/api/v1/me/assets/${id}`),
  addTransaction: (id: string, data: { action: string, units?: number, amount?: number }) => api.post(`/api/v1/me/assets/${id}/transactions`, data),
  fetchPnL: () => api.get<AssetsPnLResponse[]>("/api/v1/me/assets/pnl"),
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
  fetchAssetTransactions: (assetId: string) => api.get<TransactionHistory[]>(`/api/v1/me/assets/${assetId}/transactions`),
};