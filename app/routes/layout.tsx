import { useState, useMemo, useCallback } from "react";
import { Outlet, redirect, useNavigate, Navigate } from "react-router";
import { Toaster, toast } from "sonner";
import { AppLayout } from '~/shared/layouts';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import type { AppUser, Product, Asset, Goal, FinancialProfile, AuditLog } from "~/types";
import { useProductsStore } from '~/features/products';
import { usePortfolioStore } from '~/features/assets/portfolio.store';
import { useGoalsStore } from '~/features/goals/goals.store';
import { useAuthStore } from '~/features/auth/auth.store';
import { useAppInitialization } from '~/hooks/useAppInitialization';
import { useBackgroundRefresh } from '~/hooks/useBackgroundRefresh';
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
  const { isInitialized, isLoading, error, refetch } = useAppInitialization();
  useBackgroundRefresh();

  const [users, setUsers] = useState<AppUser[]>([]);
  const assets = usePortfolioStore((s) => s.assets);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const goals = useGoalsStore((s) => s.goals);
  const [finProfile, setFinProfile] = useState<FinancialProfile | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const products = useProductsStore((s) => s.products);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
    setLogs((prev) => [{ ...l, id: `l${Date.now()}` }, ...prev]);
  }, []);

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

  const handleChangeRiskProfile = () => {
    setShowConfirmModal(true);
  };

  if (!syncedUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4" data-testid="app-initial-loading">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-200">Loading your portfolio...</p>
      </div>
    );
  }

  if (!isInitialized && error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4" data-testid="app-initial-error">
        <p className="text-lg text-red-400 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-900 font-semibold transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <>
      <AppLayout user={syncedUser} onLogout={handleLogout} onChangeRiskProfile={handleChangeRiskProfile}>
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
      </AppLayout>

      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Change Risk Profile?"
        message="You will need to retake the risk assessment questionnaire. Your current risk profile will be replaced with the new results."
        confirmLabel="Retake Assessment"
        confirmVariant="primary"
        onConfirm={() => {
          setShowConfirmModal(false);
          navigate("/questionnaire");
        }}
      />
    </>
  );
}

