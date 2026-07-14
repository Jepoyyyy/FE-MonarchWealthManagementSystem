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

export interface LayoutContextType {
  currentUser: AppUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  finProfile: FinancialProfile;
  setFinProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  logs: AuditLog[];
  addLog: (l: Omit<AuditLog, "id">) => void;
  toast: any;
}

export default function Layout() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authView, setAuthView] = useState<View>("login");
  const [users, setUsers] = useState<AppUser[]>(INIT_USERS);
  const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS);
  const [assets, setAssets] = useState<Asset[]>(INIT_ASSETS);
  const [logs, setLogs] = useState<AuditLog[]>(INIT_LOGS);
  const [goals, setGoals] = useState<Goal[]>(INIT_GOALS);
  const [finProfile, setFinProfile] = useState<FinancialProfile>(INIT_FIN_PROFILE);
  const [showResult, setShowResult] = useState(false);
  const [resultProfile, setResultProfile] = useState<{ profile: RiskProfile; score: number } | null>(null);

  const addLog = useCallback((l: Omit<AuditLog, "id">) => {
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

  const handleRegister = (name: string, email: string, pass: string) => {
    const newUser: AppUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password: pass,
      role: "user",
      status: "active",
      riskProfile: null,
      questionnaireCompleted: false,
      createdAt: new Date().toISOString().split("T")[0],
      totalAssets: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    addLog({
      userId: newUser.id,
      userName: newUser.name,
      action: "REGISTER",
      details: "New account created",
      timestamp: new Date().toISOString(),
      category: "auth",
    });
    setCurrentUser(newUser);
    setAuthView("questionnaire");
  };

  const handleQuestionnaire = (profile: RiskProfile, score: number) => {
    if (!currentUser) return;
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
  };

  const handleLogout = () => {
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

  // Sync user total assets
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
        <LoginView users={users} onLogin={handleLogin} onNavigate={setAuthView} addLog={addLog} />
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
            setProducts,
            assets,
            setAssets,
            goals,
            setGoals,
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
