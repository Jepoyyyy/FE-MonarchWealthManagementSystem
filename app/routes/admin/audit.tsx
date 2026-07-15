import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { AdminAuditView } from "~/views/admin/AdminAuditView";

export default function AdminAuditRoute() {
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
    <AdminAuditView />
  );
}
