import { create } from "zustand";
import { ProductApi, type ProductQueryParams } from '~/features/products/api';
import type { Product, ProductType } from '~/features/products/products.types';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  fetchProducts: (params?: ProductQueryParams) => Promise<void>;
}

const normalizeType = (t: string): ProductType => {
  const typeMap: Record<string, ProductType> = {
    "money_market": "Money Market",
    "stock": "Stock",
    "bond": "Bond",
    "deposit": "Deposit",
    "balanced_fund": "Balanced Fund",
    "sukuk": "Sukuk",
    "mutual_fund": "Mutual Fund",
    "Money Market": "Money Market",
    "Stock": "Stock",
    "Bond": "Bond",
    "Deposit": "Deposit",
    "Balanced Fund": "Balanced Fund",
    "Sukuk": "Sukuk",
    "Mutual Fund": "Mutual Fund",
  };
  const mapped = typeMap[t] || typeMap[t.toLowerCase()];
  if (!mapped) {
    console.warn(`Unknown product type: "${t}". Falling back to "Mutual Fund".`);
  }
  return mapped ?? "Mutual Fund";
};

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,
  page: 0,
  totalPages: 0,
  totalElements: 0,
  isFirst: true,
  isLast: true,

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await ProductApi.list(params);
      const raw = res.data;

      let rawProducts: unknown[];
      let pageMeta = {
        number: params.page ?? 0,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
      };

      if (raw && typeof raw === "object" && "content" in raw) {
        const page = raw as {
          content: unknown[];
          totalPages: number;
          totalElements: number;
          number: number;
          first: boolean;
          last: boolean;
        };
        rawProducts = page.content;
        pageMeta = page;
      } else if (Array.isArray(raw)) {
        console.warn(
          "Products API returned a flat array instead of a Page — pagination metadata unavailable."
        );
        rawProducts = raw;
      } else {
        console.error("Invalid API response structure:", raw);
        throw new Error("Invalid response format from products API");
      }

      const products = rawProducts.map((p: any) => ({
        ...p,
        type: normalizeType(p.type),
      }));

      set({
        products,
        loading: false,
        page: pageMeta.number,
        totalPages: pageMeta.totalPages,
        totalElements: pageMeta.totalElements,
        isFirst: pageMeta.first,
        isLast: pageMeta.last,
      });
    } catch (err: any) {
      console.error("fetchProducts error:", err);
      set({ error: err.message || "Failed to load products", loading: false });
    }
  },
}));