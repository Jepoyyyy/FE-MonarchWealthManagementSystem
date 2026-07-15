import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { ProductsView } from "~/views/products/ProductsView";

export default function ProductsRoute() {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  useEffect(() => {
    if (context.currentUser && context.currentUser.role === "admin") {
      navigate("/admin/products", { replace: true });
    }
  }, [context.currentUser, navigate]);

  if (!context.currentUser || context.currentUser.role === "admin") {
    return null;
  }

  return (
    <ProductsView
      user={context.currentUser}
      addLog={context.addLog}
      toast={context.toast}
    />
  );
}
