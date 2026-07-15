import { create } from "zustand";
import { ProductApi } from "../api/products";
import type { Product } from "../types";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await ProductApi.list();
      // res.data might be wrapped (e.g. { data: [...], content: [...] }) or directly an array depending on backend serialization
      set({ products: Array.isArray(res.data) ? res.data : (res.data as any)?.content || (res.data as any)?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load products", loading: false });
    }
  },
}));