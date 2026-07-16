import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { GoalsView } from '~/features/goals/components/GoalsView';

export default function GoalsRoute() {
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
    <GoalsView
      user={context.currentUser}
      finProfile={context.finProfile ?? { monthlyIncome: 0, expenses: {} } as any}
      setFinProfile={context.setFinProfile as any}
      assets={context.assets}
      products={context.products}
      toast={context.toast}
    />
  );
}
