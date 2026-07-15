import { api } from "./client";
import type { Product } from "../types";

interface ProductUpdateDTO {
  name?: string;
  type?: "stock" | "mutual_fund" | "bond" | "deposit";
  issuer?: string;
  riskLevel?: number;
  currentPrice?: number;
  annualReturn?: number;
  visible?: boolean;
}

export const ProductApi = {
  list: () => api.get<Product[]>("/api/v1/products?size=1000"),
  update: (id: string, dto: ProductUpdateDTO) => api.put<Product>(`/api/v1/products/${id}`, dto),
};