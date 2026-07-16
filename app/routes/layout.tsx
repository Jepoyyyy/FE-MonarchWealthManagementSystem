import { useState, useMemo, useCallback, useEffect } from "react";
import { Outlet } from "react-router";
import { Toaster, toast } from "sonner";
import { AppLayout } from '~/shared/layouts';
import { LoginView, RegisterView, QuestionnaireView, ProfileResultView, useAuthManager } from '~/features/auth';
import type { AppUser, Product, Asset, Goal, FinancialProfile, AuditLog } from "~/types";
import { useProductsStore } from '~/features/products';

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

export default function Layout() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [assets] = useState<Asset[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [goals] = useState<Goal[]>([]);
  const [finProfile, setFinProfile] = useState<FinancialProfile | null>(null);

  const { products, fetchProducts } = useProductsStore();
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
    // Keep it here for compatibility with contexts, but views can also rely on backend audit trails
    setLogs((prev) => [{ ...l, id: `l${Date.now()}` }, ...prev]);
  }, []);

  const {
    currentUser,
    setCurrentUser,
    authView,
    setAuthView,
    showResult,
    setShowResult,
    resultProfile,
    handleLogin,
    handleRegister,
    handleQuestionnaire,
    handleLogout,
  } = useAuthManager(users, setUsers, addLog);

  // Sync user total assets - local fallback
  const syncedUser = useMemo(() => {
    if (!currentUser || currentUser.role === "admin") return currentUser;
    const myAssets = assets.filter((a) => a.userId === currentUser.id);
    const total = myAssets.reduce((s, a) => s + a.currentValue, 0);
    return { ...currentUser, totalAssets: total };
  }, [currentUser, assets]);

  if (!currentUser) {
    if (authView === "register") {
      return (
        <div className="w-full min-h-screen">
          <RegisterView onRegister={handleRegister} onNavigate={setAuthView} />
          <Toaster richColors position="top-right" duration={3000} />
        </div>
      );
    }
    return (
      <div className="w-full min-h-screen">
        <LoginView onLogin={handleLogin} onNavigate={setAuthView} />
        <Toaster richColors position="top-right" duration={3000} />
      </div>
    );
  }

  if (authView === "questionnaire" && !currentUser.questionnaireCompleted) {
    return (
      <div className="w-full min-h-screen">
        <QuestionnaireView user={currentUser} onComplete={handleQuestionnaire} />
        <Toaster richColors position="top-right" duration={3000} />
      </div>
    );
  }

  if (showResult && resultProfile) {
    return (
      <div className="w-full min-h-screen">
        <ProfileResultView
          profile={resultProfile.profile}
          score={resultProfile.score}
          onContinue={() => {
            setShowResult(false);
            setAuthView("dashboard");
          }}
        />
        <Toaster richColors position="top-right" duration={3000} />
      </div>
    );
  }

  const user = syncedUser!;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <Outlet
        context={
          {
            currentUser: user,
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
