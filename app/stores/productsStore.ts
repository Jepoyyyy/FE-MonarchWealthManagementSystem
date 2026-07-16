import { create } from "zustand";
import { ProductApi, type ProductQueryParams } from "../api/products";
import type { Product, ProductType } from "../types/product.types";

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
    "Money Market": "money_market",
    "money_market": "money_market",
    "Stock": "stock",
    "stock": "stock",
    "Bond": "bond",
    "bond": "bond",
    "Deposit": "deposit",
    "deposit": "deposit",
    "Balanced Fund": "mutual_fund",
    "Sukuk": "bond",
    "Mutual Fund": "mutual_fund",
    "mutual_fund": "mutual_fund",
  };
  const mapped = typeMap[t];
  if (!mapped) {
    console.warn(`Unknown product type: "${t}". Falling back to "mutual_fund".`);
  }
  return mapped ?? "mutual_fund";
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