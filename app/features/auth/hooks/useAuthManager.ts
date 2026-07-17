import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from '~/shared/api/client';
import { ProfilerApi } from '~/features/profiler';
import { riskLabel } from "~/utils";
import { useAuthStore } from '~/features/auth/auth.store';
import type { AppUser, AuditLog, RiskProfile, View } from "~/types";

export function useAuthManager(
  users: AppUser[],
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>,
  addLog: (l: Omit<AuditLog, "id">) => void
) {
  const authStoreUser = useAuthStore((state) => state.user);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(authStoreUser);
  const [authView, setAuthView] = useState<View>("login");
  const [showResult, setShowResult] = useState(false);
  const [resultProfile, setResultProfile] = useState<{ profile: RiskProfile; score: number } | null>(null);

  // Sync initial hydration from zustand
  useEffect(() => {
    if (!authStoreUser) {
      setCurrentUser(null);
      setAuthView("login");
      return;
    }

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
      await ProfilerApi.submitAnswers({ answers });
      const updated = { ...currentUser, riskProfile: profile, questionnaireCompleted: true };

      const { token, refreshToken } = useAuthStore.getState();
      if (token && refreshToken) {
        useAuthStore.getState().setAuth(token, refreshToken, updated);
      }

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
      setCurrentUser(null);
      setAuthView("login");
      setShowResult(false);
      setResultProfile(null);
    }
  };

  return {
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
  };
}
