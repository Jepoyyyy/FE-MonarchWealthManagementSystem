import { useState, useMemo, useCallback, useEffect } from "react";
import { Outlet } from "react-router";
import { Toaster, toast } from "sonner";
import { AppLayout } from '~/shared/layouts';
import { LoginView, RegisterView, QuestionnaireView, ProfileResultView, useAuthManager } from '~/features/auth';
import type { AppUser, Product, Asset, Goal, FinancialProfile, AuditLog } from "~/types";
import { useProductsStore } from '~/features/products';
import { usePortfolioStore } from '~/features/assets/portfolio.store';
import { useGoalsStore } from '~/features/goals/goals.store';

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
  const assets = usePortfolioStore((s) => s.assets);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const goals = useGoalsStore((s) => s.goals);
  const [finProfile, setFinProfile] = useState<FinancialProfile | null>(null);

  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const fetchGoals = useGoalsStore((s) => s.fetchGoals);
  const fetchProjections = useGoalsStore((s) => s.fetchProjections);

  const { products, fetchProducts } = useProductsStore();
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
    
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

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      fetchPortfolio();
      fetchGoals();
      fetchProjections();
      
      // Fetch financial profile
      import('~/features/finances').then(({ FinancesApi }) => {
        FinancesApi.get()
          .then((response) => {
            const data = response.data;
            setFinProfile({
              monthlyIncome: data.monthlyIncome || 0,
              expenses: {
                housing: data.housing || 0,
                food: data.food || 0,
                transport: data.transport || 0,
                utilities: data.utilities || 0,
                healthcare: data.healthcare || 0,
                entertainment: data.entertainment || 0,
                insurance: data.insurance || 0,
                other: data.other || 0,
              },
            });
          })
          .catch(() => {
            // If profile doesn't exist yet, use empty defaults
            setFinProfile({
              monthlyIncome: 0,
              expenses: {
                housing: 0,
                food: 0,
                transport: 0,
                utilities: 0,
                healthcare: 0,
                entertainment: 0,
                insurance: 0,
                other: 0,
              },
            });
          });
      });
    }
  }, [currentUser, fetchPortfolio, fetchGoals, fetchProjections]);

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
