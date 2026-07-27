import { useEffect } from "react";
import { useAuthStore } from "~/features/auth/auth.store";
import { usePortfolioStore } from "~/features/assets/portfolio.store";
import { useGoalsStore } from "~/features/goals/goals.store";
import { useDashboardStore } from "~/features/dashboard/dashboard.store";
import { useProductsStore } from "~/features/products/products.store";

const BACKGROUND_INTERVAL = 2.5 * 60 * 1000; // 2.5 minutes

export function useBackgroundRefresh() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const runRefresh = () => {
      if (document.visibilityState === "visible") {
        useProductsStore.getState().backgroundRefresh();
        if (user.role !== "admin") {
          usePortfolioStore.getState().backgroundRefresh();
          useGoalsStore.getState().backgroundRefresh();
          useDashboardStore.getState().backgroundRefresh();
        }
      }
    };

    const intervalId = setInterval(runRefresh, BACKGROUND_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);
}
