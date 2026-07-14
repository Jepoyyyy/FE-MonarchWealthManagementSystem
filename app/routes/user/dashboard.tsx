import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { DashboardView } from "~/views/dashboard/DashboardView";

export default function DashboardRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  useEffect(() => {
    if (context.currentUser && context.currentUser.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [context.currentUser, navigate]);

  if (!context.currentUser || context.currentUser.role === "admin") {
    return null;
  }

  return (
    <DashboardView
      user={context.currentUser}
      products={context.products}
      assets={context.assets}
      onNavigate={navigate}
    />
  );
}
