import { api } from '~/shared/api/client';
import type { Product, Page } from '~/features/products/products.types';

interface ProductUpdateDTO {
  name?: string;
  type?: "Stock" | "Mutual Fund" | "Bond" | "Deposit" | "Money Market";
  issuer?: string;
  riskLevel?: number;
  currentPrice?: number;
  annualReturn?: number;
  visible?: boolean;
}

export interface ProductQueryParams {
  searchQuery?: string;
  type?: string;
  showAll?: boolean;
  dashboardSummary?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const ProductApi = {
  list: (params: ProductQueryParams = {}) => {
    const query = new URLSearchParams();
    if (params.searchQuery) query.set("searchQuery", params.searchQuery);
    if (params.type) query.set("type", params.type);
    if (params.showAll !== undefined) query.set("showAll", String(params.showAll));
    if (params.dashboardSummary !== undefined) {
      query.set("dashboardSummary", String(params.dashboardSummary));
    }
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));
    if (params.sort) query.set("sort", params.sort);
    return api.get<Page<Product>>(`/api/v1/products?${query.toString()}`);
  },

  update: (id: string, dto: ProductUpdateDTO) =>
    api.put<Product>(`/api/v1/products/${id}`, dto),

  getById: (id: string) =>
    api.get<Product>(`/api/v1/products/${id}`),
};