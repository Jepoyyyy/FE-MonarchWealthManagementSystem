import type { ProductType } from "~/shared/types/common";
export type { ProductType };

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
