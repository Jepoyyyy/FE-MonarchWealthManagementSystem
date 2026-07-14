import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { RecommendationsView } from "~/views/recommendations/RecommendationsView";

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
    <RecommendationsView
      user={context.currentUser}
      assets={context.assets}
      products={context.products}
      goals={context.goals}
      finProfile={context.finProfile}
      setAssets={context.setAssets}
      addLog={context.addLog}
      toast={context.toast}
    />
  );
}
