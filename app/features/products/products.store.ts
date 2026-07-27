import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductApi, type ProductQueryParams } from '~/features/products/api';
import type { Product, ProductType } from '~/features/products/products.types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  lastFetched: number | null;
  fetchProducts: (params?: ProductQueryParams, force?: boolean) => Promise<void>;
  backgroundRefresh: () => Promise<void>;
}

const normalizeType = (t: string): ProductType => {
  const typeMap: Record<string, ProductType> = {
    "money_market": "Money Market",
    "stock": "Stock",
    "bond": "Bond",
    "deposit": "Bank Deposit",
    "bank_deposit": "Bank Deposit",
    "balanced_fund": "Balanced Fund",
    "sukuk": "Sukuk",
    "mutual_fund": "Mutual Fund",
    "Money Market": "Money Market",
    "Stock": "Stock",
    "Bond": "Bond",
    "Deposit": "Bank Deposit",
    "Bank Deposit": "Bank Deposit",
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

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,
      page: 0,
      totalPages: 0,
      totalElements: 0,
      isFirst: true,
      isLast: true,
      lastFetched: null,

      fetchProducts: async (params = {}, force = false) => {
        const { lastFetched, loading, products: currentProducts } = get();
        if (loading) return;

        // Skip fetch if params empty, force false, and cache is fresh
        const isDefaultParams = Object.keys(params).length === 0;
        const now = Date.now();
        if (!force && isDefaultParams && currentProducts.length > 0 && lastFetched && now - lastFetched < CACHE_TTL) {
          return;
        }

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
            lastFetched: Date.now(),
          });
        } catch (err: any) {
          console.error("fetchProducts error:", err);
          set({ error: err.message || "Failed to load products", loading: false });
        }
      },

      backgroundRefresh: async () => {
        try {
          const res = await ProductApi.list({});
          const raw = res.data;
          let rawProducts: unknown[] = [];
          if (raw && typeof raw === "object" && "content" in raw) {
            rawProducts = (raw as any).content;
          } else if (Array.isArray(raw)) {
            rawProducts = raw;
          }
          if (rawProducts.length > 0) {
            const products = rawProducts.map((p: any) => ({
              ...p,
              type: normalizeType(p.type),
            }));
            set({ products, lastFetched: Date.now() });
          }
        } catch (err) {
          // Silent failure
        }
      },
    }),
    {
      name: 'products-storage',
      partialize: (state) => ({
        products: state.products,
        lastFetched: state.lastFetched,
      }),
    }
  )
);