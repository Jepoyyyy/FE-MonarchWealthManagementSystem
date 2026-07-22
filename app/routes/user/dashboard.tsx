import { lazy, Suspense, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";

const DashboardView = lazy(() => import("~/features/dashboard/components/DashboardView").then(m => ({ default: m.DashboardView })));

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
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <DashboardView
        user={context.currentUser}
        products={context.products}
        onNavigate={navigate}
      />
    </Suspense>
  );
}
