import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AdminDashboardView } from '~/features/admin';

export default function AdminDashboardRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  useEffect(() => {
    if (context.currentUser && context.currentUser.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [context.currentUser, navigate]);

  if (!context.currentUser || context.currentUser.role !== "admin") {
    return null;
  }

  return (
    <AdminDashboardView
      users={context.users}
      products={context.products}
      assets={context.assets}
    />
  );
}
