import { useState, useMemo, useCallback, useEffect } from "react";
import { Outlet, redirect, useNavigate } from "react-router";
import { Toaster, toast } from "sonner";
import { AppLayout } from '~/shared/layouts';
import type { AppUser, Product, Asset, Goal, FinancialProfile, AuditLog } from "~/types";
import { useProductsStore } from '~/features/products';
import { usePortfolioStore } from '~/features/assets/portfolio.store';
import { useGoalsStore } from '~/features/goals/goals.store';
import { useAuthStore } from '~/features/auth/auth.store';
import type { Route } from "./+types/layout";

export interface LayoutContextType {
  currentUser: AppUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  products: Product[];
  assets: Asset[];
  goals: Goal[];
  finProfile: FinancialProfile | null;
  setFinProfile: React.Dispatch<React.SetStateAction<FinancialProfile | null>>;
  logs: AuditLog[];
  addLog: (l: Omit<AuditLog, "id">) => void;
  toast: any;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect('/login');
  }
  // Admin users are not redirected to questionnaire even if incomplete
  if (user.role !== "admin" && !user.questionnaireCompleted) {
    throw redirect('/questionnaire');
  }
  return { user };
}
clientLoader.hydrate = true as const;

export default function Layout() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AppUser[]>([]);
  const assets = usePortfolioStore((s) => s.assets);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const goals = useGoalsStore((s) => s.goals);
  const [finProfile, setFinProfile] = useState<FinancialProfile | null>(null);

  const products = useProductsStore((s) => s.products);
  useEffect(() => {
    useProductsStore.getState().fetchProducts();
  }, []);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
    setLogs((prev) => [{ ...l, id: `l${Date.now()}` }, ...prev]);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      usePortfolioStore.getState().fetchPortfolio();
    }
  }, [currentUser]);

  // Sync user total assets - local fallback
  const syncedUser = useMemo(() => {
    if (!currentUser || currentUser.role === "admin") return currentUser;
    const myAssets = assets.filter((a) => a.userId === currentUser.id);
    const total = myAssets.reduce((s, a) => s + a.currentValue, 0);
    return { ...currentUser, totalAssets: total };
  }, [currentUser, assets]);

  const handleLogout = async () => {
    try {
      const { AuthApi } = await import("~/features/auth/api");
      await AuthApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      useAuthStore.getState().clearAuth();
      if (currentUser) {
        addLog({
          userId: currentUser.id,
          userName: currentUser.name,
          action: "LOGOUT",
          details: "User signed out",
          timestamp: new Date().toISOString(),
          category: "auth",
        });
      }
      navigate("/login", { replace: true });
    }
  };

  const setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>> = useCallback((action) => {
    const prevUser = useAuthStore.getState().user;
    const nextUser = typeof action === "function" ? action(prevUser) : action;
    if (nextUser) {
      const { token, refreshToken } = useAuthStore.getState();
      if (token && refreshToken) {
        useAuthStore.getState().setAuth(token, refreshToken, nextUser);
      }
    } else {
      useAuthStore.getState().clearAuth();
    }
  }, []);

  if (!syncedUser) {
    return null;
  }

  return (
    <AppLayout user={syncedUser} onLogout={handleLogout}>
      <Outlet
        context={
          {
            currentUser: syncedUser,
            setCurrentUser,
            users,
            setUsers,
            products,
            assets,
            goals,
            finProfile,
            setFinProfile,
            logs,
            addLog,
            toast,
          } satisfies LayoutContextType
        }
      />
      <Toaster richColors position="top-right" duration={3000} />
    </AppLayout>
  );
}
