import { lazy, Suspense, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import { ErrorBoundary } from "~/components/ErrorBoundary";

const ProductsView = lazy(() => import("~/features/products/components/ProductsView").then(m => ({ default: m.ProductsView })));

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
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <ProductsView
          user={context.currentUser}
          addLog={context.addLog}
          toast={context.toast}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
