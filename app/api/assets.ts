import { api } from "./client";
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";

function toDateArray(dateStr: string | undefined): number[] | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  return [y, m, d, 0, 0, 0];
}

function toAssetPayload(data: Omit<Asset, "id">) {
  return {
    product_id: data.productId,
    amount: data.amount,
    purchase_date: toDateArray(data.purchaseDate),
    current_value: data.currentValue,
    units: data.quantity,
    goal_id: data.goalId,
    tenor_months: data.tenorMonths,
    platform: data.platform,
    notes: data.notes,
  };
}

export const AssetApi = {
  list: () => api.get<Asset[]>("/api/v1/me/assets"),
  create: (data: Omit<Asset, "id">) => api.post<Asset>("/api/v1/me/assets", toAssetPayload(data)),
  update: (id: string, data: Partial<Asset>) => api.patch<Asset>(`/api/v1/me/assets/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/me/assets/${id}`),
  addTransaction: (id: string, data: { type: string, quantity: number, price: number }) => api.post(`/api/v1/me/assets/${id}/transactions`, data),
  fetchPnL: () => api.get<AssetsPnLResponse[]>("/api/v1/me/assets/pnl"),
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
};