import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AssetsView } from "~/views/assets/AssetsView";

export default function AssetsRoute() {
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

  const monthlyExpenses = Object.values(context.finProfile.expenses).reduce((a, b) => a + b, 0);
  const surplus = context.finProfile.monthlyIncome - monthlyExpenses;

  return (
    <AssetsView
      user={context.currentUser}
      products={context.products}
      assets={context.assets}
      setAssets={context.setAssets}
      addLog={context.addLog}
      goals={context.goals}
      investableSurplus={Math.max(surplus, 0)}
    />
  );
}
