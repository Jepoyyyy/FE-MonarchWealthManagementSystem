import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AdminUsersView } from "~/views/admin/AdminUsersView";

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
    <AdminUsersView
      users={context.users}
      setUsers={context.setUsers}
      addLog={context.addLog}
      adminUser={context.currentUser}
      toast={context.toast}
    />
  );
}
