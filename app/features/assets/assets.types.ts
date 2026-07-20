export interface Asset {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  purchaseDate: string;
  currentValue: number;
  quantity?: number;
  platform?: string;
  notes?: string;
  goalId?: string;
  tenorMonths?: number;
  name?: string;
  issuer?: string;
  type?: string;
}

export interface AssetsPnLResponse {
  assetId: string;
  productId: string;
  productName: string;
  productType: string;
  units: number;
  currentValue: number;
  avg_price: number;
  potential_pnl: number;
  potential_pnl_percent: number;
  realized_pnl: number;
  realized_pnl_percent: number;
}

export interface TransactionHistory {
  id: string;
  assetId: string;
  action: "BUY" | "SELL";
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  transactionDate: string;
}

export interface AssetRegistrationDTO {
  productId: string;
  units: number;
}
