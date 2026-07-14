import React, { useEffect } from "react";
import { useAuthStore } from "~/stores/authStore";
import type { View } from "~/types";

interface RoleShieldProps {
  allowedRoles: Array<"admin" | "user">;
  fallbackView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

export function RoleShield({ allowedRoles, fallbackView, onNavigate, children }: RoleShieldProps) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      onNavigate("login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      onNavigate(fallbackView);
    }
  }, [user, allowedRoles, fallbackView, onNavigate]);

  // Prevent rendering protected content while the effect evaluates/redirects
  if (!user || !allowedRoles.includes(user.role)) {
    return null; 
  }

  return <>{children}</>;
}