import { useMemo } from "react";
import type { Asset, AssetsPnLResponse } from "~/types";
import { calculatePortfolioValue, calculateWeightedReturn } from "~/features/goals/goals.calculations";

interface PortfolioMetrics {
  assets: Asset[];
  totalValue: number;
  weightedReturn: number | null;
}

export function usePortfolio(
  allAssets: Asset[],
  pnlData: AssetsPnLResponse[],
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
    () => calculateWeightedReturn(userAssets, pnlData),
    [userAssets, pnlData]
  );

  return { assets: userAssets, totalValue, weightedReturn };
}
