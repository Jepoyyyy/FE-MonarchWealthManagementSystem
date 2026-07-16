import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { DashboardView } from '~/features/dashboard/components/DashboardView';

export default function DashboardRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  return (
    <DashboardView
      user={context.currentUser!}
      products={context.products}
      onNavigate={navigate}
    />
  );
}
