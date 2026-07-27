import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "~/features/auth/auth.store";
import { useProductsStore } from "~/features/products/products.store";
import { usePortfolioStore } from "~/features/assets/portfolio.store";
import { useGoalsStore } from "~/features/goals/goals.store";
import { useDashboardStore } from "~/features/dashboard/dashboard.store";

import { measurePerformance } from "~/utils/performance";

export interface UseAppInitializationReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export async function invalidateAppStores(force = true): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  const fetchTasks: Promise<void>[] = [
    useProductsStore.getState().fetchProducts(undefined, force),
  ];

  if (user.role !== "admin") {
    // Lazily invalidate background stores so they refresh next time their view is visited
    useDashboardStore.getState().invalidateCache();
    usePortfolioStore.getState().invalidateCache();

    fetchTasks.push(
      usePortfolioStore.getState().fetchPortfolio(force),
      useGoalsStore.getState().fetchGoals(force)
    );
  }

  await Promise.allSettled(fetchTasks);
}

export function useAppInitialization(): UseAppInitializationReturn {
  const user = useAuthStore((s) => s.user);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializingRef = useRef(false);

  const initData = useCallback(async (force = false) => {
    if (!user) return;
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await measurePerformance("CentralizedAppInitialization", async () => {
        const fetchTasks: Promise<void>[] = [
          useProductsStore.getState().fetchProducts(undefined, force),
        ];

        if (user.role !== "admin") {
          fetchTasks.push(
            usePortfolioStore.getState().fetchPortfolio(force),
            useGoalsStore.getState().fetchGoals(force),
            useDashboardStore.getState().fetchDashboard(force)
          );
        }

        await Promise.allSettled(fetchTasks);
      });
      setIsInitialized(true);
    } catch (err: any) {
      setError(err?.message || "Failed to initialize app data");
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user && !isInitialized && !isInitializingRef.current) {
      initData(false);
    }
  }, [user, isInitialized, initData]);

  return { isInitialized, isLoading, error, refetch: () => initData(true) };
}

