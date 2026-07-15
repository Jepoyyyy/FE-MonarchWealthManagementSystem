import { useState, useMemo, useCallback } from "react";
import { Outlet } from "react-router";
import { Toaster, toast } from "sonner";
import { AppLayout } from "~/components/layout";
import { LoginView } from "~/views/auth/LoginView";
import { RegisterView } from "~/views/auth/RegisterView";
import { QuestionnaireView } from "~/views/auth/QuestionnaireView";
import { ProfileResultView } from "~/views/auth/ProfileResultView";
import type { AppUser, Product, Asset, Goal, FinancialProfile, AuditLog, RiskProfile, View } from "~/types";
import {
  INIT_USERS,
  INIT_PRODUCTS,
  INIT_ASSETS,
  INIT_LOGS,
  INIT_GOALS,
  INIT_FIN_PROFILE,
} from "~/data";
import { riskLabel } from "~/utils";
import { useAuthStore } from "~/stores/authStore";
import { useEffect } from "react";
import { api } from "~/api/client";

export interface LayoutContextType {
  currentUser: AppUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  products: Product[];
  assets: Asset[];
  goals: Goal[];
  finProfile: FinancialProfile;
  setFinProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  logs: AuditLog[];
  addLog: (l: Omit<AuditLog, "id">) => void;
  toast: any;
}

export default function Layout() {
  const authStoreUser = useAuthStore((state) => state.user);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(authStoreUser);
  const [authView, setAuthView] = useState<View>("login");

  // Sync initial hydration from zustand
  useEffect(() => {
    if (authStoreUser && !currentUser) {
      setCurrentUser(authStoreUser);
      if (authStoreUser.role === "admin") {
        setAuthView("admin-dashboard");
      } else if (!authStoreUser.questionnaireCompleted) {
        setAuthView("questionnaire");
      } else {
        setAuthView("dashboard");
      }
    }
  }, [authStoreUser, currentUser]);
  const [users, setUsers] = useState<AppUser[]>(INIT_USERS);
  const [products] = useState<Product[]>(INIT_PRODUCTS);
  const [assets] = useState<Asset[]>(INIT_ASSETS);
  const [logs, setLogs] = useState<AuditLog[]>(INIT_LOGS);
  const [goals] = useState<Goal[]>(INIT_GOALS);
  const [finProfile, setFinProfile] = useState<FinancialProfile>(INIT_FIN_PROFILE);
  const [showResult, setShowResult] = useState(false);
  const [resultProfile, setResultProfile] = useState<{ profile: RiskProfile; score: number } | null>(null);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
    // Keep it here for compatibility with contexts, but views can also rely on backend audit trails
    setLogs((prev) => [{ ...l, id: `l${Date.now()}` }, ...prev]);
  }, []);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      setAuthView("admin-dashboard");
    } else if (!user.questionnaireCompleted) {
      setAuthView("questionnaire");
    } else {
      setAuthView("dashboard");
    }
  };

  const handleRegister = (user: AppUser) => {
    setCurrentUser(user);
    setAuthView("questionnaire");
  };

  const handleQuestionnaire = async (profile: RiskProfile, score: number, answers: { questionnaireAnswer: string; score: number }[]) => {
    if (!currentUser) return;
    try {
      // Assuming a backend endpoint exists to update the questionnaire profile
      await api.put("/api/v1/me/profiler", answers);
      const updated = { ...currentUser, riskProfile: profile, questionnaireCompleted: true };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
      addLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: "QUESTIONNAIRE_COMPLETE",
        details: `Risk profile set to ${riskLabel(profile)} (score: ${score}/10)`,
        timestamp: new Date().toISOString(),
        category: "questionnaire",
      });
      setResultProfile({ profile, score });
      setShowResult(true);
    } catch (err: any) {
      toast.error("Gagal menyimpan profil", { description: err.message });
    }
  };

  const handleLogout = () => {
    import("~/api/auth").then(m => m.AuthApi.logout().catch(() => {}));
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
    setCurrentUser(null);
    setAuthView("login");
    setShowResult(false);
    setResultProfile(null);
  };

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
