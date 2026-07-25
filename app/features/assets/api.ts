import { api } from '~/shared/api/client';
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";

function formatPurchaseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  if (dateStr.includes(" ")) return dateStr;
  return `${dateStr} 00:00:00`;
}

function mapQty(asset: any, products: any[]) {
  const targetId = asset.product_id ?? asset.productId;
  const p = products.find(prod => String(prod.id) === String(targetId)) || asset.product;
  const units = asset.units ?? asset.quantity ?? 0;
  const isStock = p?.type === "Stock" || p?.type === "stock";
  const lotSize = p?.lotSize || (isStock ? 100 : 1);
  return isStock ? units / lotSize : units;
}

function toAssetPayload(data: Omit<Asset, "id">, products: any[]) {
  const p = products.find(prod => String(prod.id) === String(data.productId)) || (data as any).product;
  const isStock = p?.type === "Stock" || p?.type === "stock";
  const lotSize = p?.lotSize || (isStock ? 100 : 1);
  const units = isStock && data.quantity ? data.quantity * lotSize : data.quantity;
  return {
    product_id: p?.id ?? (Number(data.productId) || data.productId),
    amount: data.amount,
    purchase_date: formatPurchaseDate(data.purchaseDate),
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
  const p = products.find(prod => String(prod.id) === String(asset.product_id ?? asset.productId));
  const camel = {
    id: asset.id,
    userId: asset.user_id ?? asset.userId,
    productId: asset.product_id ?? asset.productId,
    goalId: asset.goal_id ?? asset.goalId,
    amount: asset.amount,
    units: asset.units ?? asset.quantity ?? 0,
    currentValue: asset.current_value ?? asset.currentValue,
    platform: asset.platform,
    notes: asset.notes,
    purchaseDate: (asset.purchase_date ?? asset.purchaseDate ?? "").split(" ")[0],
    updatedAt: asset.updated_at ?? asset.updatedAt,
    name: asset.name || p?.name,
    issuer: asset.issuer || p?.issuer,
    type: normalizedType || p?.type,
  };
  return {
    ...camel,
    quantity: mapQty(camel, products),
  } as Asset;
}

export const AssetApi = {
  list: async (products: any[]) => {
    const res = await api.get<any>("/api/v1/me/assets", { timeout: 10000 });
    if (typeof res.data === "string") {
      throw new Error("Invalid server response: Invalid JSON or string response received");
    }
    let rawData: any[] = [];
    if (Array.isArray(res.data)) {
      rawData = res.data;
    } else if (res.data && typeof res.data === "object") {
      if (Array.isArray(res.data.result)) {
        rawData = res.data.result;
      } else if (res.data.result === null || res.data.result === undefined) {
        rawData = [];
      } else {
        throw new Error("Invalid server response: Expected array of assets");
      }
    } else if (res.data === null || res.data === undefined) {
      rawData = [];
    } else {
      throw new Error("Invalid server response: Expected array of assets");
    }

    const mapped = rawData.map((asset: any) => mapAsset(asset, products));
    return { ...res, data: mapped };
  },

  getById: async (id: string, products: any[] = []) => {
    const res = await api.get<any>(`/api/v1/me/assets/${id}`);
    const mapped = res.data ? mapAsset(res.data, products) : res.data;
    return { ...res, data: mapped };
  },

  create: async (data: Omit<Asset, "id">, products: any[]) => {
    const res = await api.post<any>("/api/v1/me/assets", toAssetPayload(data, products), { timeout: 10000 });
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
  fetchPnL: async () => {
    const res = await api.get<any>("/api/v1/me/assets/pnl");
    let list: AssetsPnLResponse[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data?.result && Array.isArray(res.data.result)) {
      list = res.data.result;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      list = res.data.data;
    }
    return { ...res, data: list };
  },
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
  fetchAssetTransactions: async (assetId: string) => {
    const res = await api.get<any>(`/api/v1/me/assets/${assetId}/transactions`);
    let list: TransactionHistory[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data?.result && Array.isArray(res.data.result)) {
      list = res.data.result;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      list = res.data.data;
    }
    return { ...res, data: list };
  },
};