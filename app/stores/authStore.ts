import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser } from "~/types";

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: AppUser | null;
    setAuth: (token: string, refreshToken: string, user: AppUser) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: "wms-auth" }
  )
);