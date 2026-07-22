import { lazy, Suspense, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";

const AdminUsersView = lazy(() => import("~/features/admin/components/AdminUsersView").then(m => ({ default: m.AdminUsersView })));

export default function AdminUsersRoute() {
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
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <AdminUsersView
        addLog={context.addLog}
        adminUser={context.currentUser}
        toast={context.toast}
      />
    </Suspense>
  );
}
