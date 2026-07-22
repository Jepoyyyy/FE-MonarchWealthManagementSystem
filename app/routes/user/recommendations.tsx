import { lazy, Suspense, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";

const RecommendationsView = lazy(() => import("~/features/recommendations/components/RecommendationsView").then(m => ({ default: m.RecommendationsView })));

export default function RecommendationsRoute() {
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
      <RecommendationsView
        user={context.currentUser}
        assets={context.assets}
        products={context.products}
        goals={context.goals}
        finProfile={context.finProfile ?? { monthlyIncome: 0, expenses: {} } as any}
        addLog={context.addLog}
        toast={context.toast}
      />
    </Suspense>
  );
}
