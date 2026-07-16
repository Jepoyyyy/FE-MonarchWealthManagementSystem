import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { ProgressView } from '~/features/progress/components/ProgressView';

export default function ProgressRoute() {
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
    <ProgressView
      user={context.currentUser}
      products={context.products}
      goals={context.goals}
      finProfile={context.finProfile ?? { monthlyIncome: 0, expenses: {} } as any}
    />
  );
}
