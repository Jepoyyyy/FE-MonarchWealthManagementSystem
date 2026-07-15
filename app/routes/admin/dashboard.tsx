import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AdminDashboardView } from "~/views/admin/AdminDashboardView";

export default function AdminDashboardRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  return (
    <AdminDashboardView
      users={context.users}
      products={context.products}
      assets={context.assets}
    />
  );
}
