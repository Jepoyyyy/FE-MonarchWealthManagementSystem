import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser, RiskProfile } from '~/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AppUser | null;
  setAuth: (token: string, refreshToken: string, user: any) => void;
  clearAuth: () => void;
  updateUserRiskProfile: (profile: RiskProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => {
        if (!user) {
          set({ token, refreshToken, user: null });
          return;
        }

        let mappedRole: "user" | "admin" = "user";
        const rawRole = user.role || (user.isAdmin ? "admin" : "user");
        if (typeof rawRole === "string" && rawRole.toLowerCase() === "admin") {
          mappedRole = "admin";
        }

        const mappedUser: AppUser = {
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          password: user.password || "",
          role: mappedRole,
          status: user.status || "active",
          riskProfile: user.riskProfile || user.risk_profile || null,
          questionnaireCompleted: user.questionnaireCompleted ?? false,
          createdAt: user.createdAt || new Date().toISOString(),
          totalAssets: user.totalAssets ?? 0,
        };

        set({ token, refreshToken, user: mappedUser });
      },
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
      updateUserRiskProfile: (profile: RiskProfile) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              riskProfile: profile,
              questionnaireCompleted: true,
            },
          };
        });
      },
    }),
    { name: 'wms-auth' }
  )
);