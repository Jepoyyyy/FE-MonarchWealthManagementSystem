export type ProductType = "money_market" | "deposit" | "bond" | "mutual_fund" | "stock";

export interface Product {
  id: string;
  code: string;
  name: string;
  issuer: string;
  type: ProductType;
  riskLevel: number;
  annualReturn: number;
  minInvestment: number;
  currentPrice: number;
  visible: boolean;
  description: string;
  tenor: string;
  lotSize: number;
  isFractionalAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}