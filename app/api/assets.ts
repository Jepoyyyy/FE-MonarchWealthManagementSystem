import { api } from "./client";
import type { Asset, AssetsPnLResponse, TransactionHistory } from "~/types";

export const AssetApi = {
  list: () => api.get<Asset[]>("/api/v1/me/assets"),
  fetchPnL: () => api.get<AssetsPnLResponse[]>("/api/v1/me/assets/pnl"),
  fetchLogs: () => api.get<TransactionHistory[]>("/api/v1/me/assets/transaction-logs"),
};