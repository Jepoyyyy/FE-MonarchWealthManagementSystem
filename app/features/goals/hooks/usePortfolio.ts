import { useMemo } from "react";
import type { Asset, Product } from "~/types";
import { calculatePortfolioValue, calculateWeightedReturn } from "~/features/goals/goals.calculations";

interface PortfolioMetrics {
  assets: Asset[];
  totalValue: number;
  weightedReturn: number | null;
}

export function usePortfolio(
  allAssets: Asset[],
  products: Product[],
  userId: string
): PortfolioMetrics {
  const userAssets = useMemo(
    () => allAssets.filter((a) => a.userId === userId),
    [allAssets, userId]
  );

  const totalValue = useMemo(
    () => calculatePortfolioValue(userAssets),
    [userAssets]
  );

  const weightedReturn = useMemo(
    () => calculateWeightedReturn(userAssets, products, totalValue),
    [userAssets, products, totalValue]
  );

  return { assets: userAssets, totalValue, weightedReturn };
}
