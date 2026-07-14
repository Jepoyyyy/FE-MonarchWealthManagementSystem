import type { AppUser, RiskProfile, AuditLog } from "~/types";
import { riskLabel } from "~/utils";

export const AuthService = {
  createRegisteredUser(name: string, email: string, pass: string): AppUser {
    return {
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
  },

  createRegisterLog(user: AppUser): Omit<AuditLog, "id"> {
    return {
      userId: user.id,
      userName: user.name,
      action: "REGISTER",
      details: "New account created",
      timestamp: new Date().toISOString(),
      category: "auth",
    };
  },

  completeQuestionnaire(user: AppUser, profile: RiskProfile, score: number): {
    updatedUser: AppUser;
    auditLog: Omit<AuditLog, "id">;
  } {
    const updatedUser = {
      ...user,
      riskProfile: profile,
      questionnaireCompleted: true,
    };

    const auditLog: Omit<AuditLog, "id"> = {
      userId: user.id,
      userName: user.name,
      action: "QUESTIONNAIRE_COMPLETE",
      details: `Risk profile set to ${riskLabel(profile)} (score: ${score}/10)`,
      timestamp: new Date().toISOString(),
      category: "questionnaire",
    };

    return { updatedUser, auditLog };
  },

  createLogoutLog(user: AppUser): Omit<AuditLog, "id"> {
    return {
      userId: user.id,
      userName: user.name,
      action: "LOGOUT",
      details: "User signed out",
      timestamp: new Date().toISOString(),
      category: "auth",
    };
  }
};
