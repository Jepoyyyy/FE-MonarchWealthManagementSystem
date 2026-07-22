import { lazy, Suspense, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { usePortfolioStore } from '~/features/assets/portfolio.store';

const AssetsView = lazy(() => import("~/features/assets/components/AssetsView").then(m => ({ default: m.AssetsView })));

export default function AssetsRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  useEffect(() => {
    usePortfolioStore.getState().fetchPortfolio();
  }, []);

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
      <AssetsView
        user={context.currentUser}
        products={context.products}
        addLog={context.addLog}
        goals={context.goals}
      />
    </Suspense>
  );
}
