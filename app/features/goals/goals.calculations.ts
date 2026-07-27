import type { Asset, Goal, AssetsPnLResponse } from "~/types";

/**
 * Calculate total portfolio value from user assets
 */
export function calculatePortfolioValue(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
}

/**
 * Calculate weighted return rate from actual asset holdings and PnL
 * @returns Percentage as decimal (e.g., 8.5 for 8.5%) or null if no holdings
 */
export function calculateWeightedReturn(
  assets: Asset[],
  pnlData: AssetsPnLResponse[] = []
): number | null {
  if (!assets || assets.length === 0) return null;

  if (pnlData && pnlData.length > 0) {
    const totalValue = pnlData.reduce((s, a) => s + (a.currentValue || 0), 0);
    const totalCost = pnlData.reduce((s, a) => s + (a.units * a.avg_price), 0);
    if (totalCost <= 0) return null;
    const returnPct = ((totalValue - totalCost) / totalCost) * 100;
    return parseFloat(returnPct.toFixed(2));
  }

  const totalValue = assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const totalCost = assets.reduce((s, a) => s + (a.amount || 0), 0);
  if (totalCost <= 0) return null;
  const returnPct = ((totalValue - totalCost) / totalCost) * 100;
  return parseFloat(returnPct.toFixed(2));
}

/**
 * Calculate auto-allocation amounts for other goals
 */
export function calculateAutoAllocation(
  surplus: number,
  primaryPct: number,
  otherGoalsCount: number
): { primaryAmount: number; otherGoalAmount: number } {
  if (surplus <= 0 || otherGoalsCount === 0) {
    return { primaryAmount: 0, otherGoalAmount: 0 };
  }

  const primaryAmount = Math.round((surplus * primaryPct) / 100);
  const remaining = Math.max(0, surplus - primaryAmount);
  const otherGoalAmount = Math.floor(remaining / otherGoalsCount);

  return { primaryAmount, otherGoalAmount };
}

/**
 * Calculate average funding percentage across all goals
 */
export function calculateAverageFunded(goals: Goal[], assets?: Asset[]): number {
  if (goals.length === 0) return 0;

  const totalFundedPct = goals.reduce((sum, goal) => {
    const assignedAssets = assets ? assets.filter((a) => a.goalId === goal.id) : [];
    const assetCurrentValue = assignedAssets.reduce((s, a) => s + a.currentValue, 0);
    const effectiveSaved = assetCurrentValue + goal.currentSaved;
    const fundedPct = Math.min((effectiveSaved / goal.targetAmount) * 100, 100);
    return sum + fundedPct;
  }, 0);

  return Math.round(totalFundedPct / goals.length);
}
