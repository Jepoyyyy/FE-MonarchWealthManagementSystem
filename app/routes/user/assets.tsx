import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AssetsView } from '~/features/assets/components/AssetsView';
import { usePortfolioStore } from '~/features/assets/portfolio.store';

export default function AssetsRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();
  const { fetchPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    if (context.currentUser && context.currentUser.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [context.currentUser, navigate]);

  if (!context.currentUser || context.currentUser.role === "admin") {
    return null;
  }


  return (
    <AssetsView
      user={context.currentUser}
      products={context.products}
      addLog={context.addLog}
      goals={context.goals}
    />
  );
}
