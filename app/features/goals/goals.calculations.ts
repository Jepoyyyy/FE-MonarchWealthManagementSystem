import type { Asset, Goal, Product } from "~/types";

/**
 * Calculate total portfolio value from user assets
 */
export function calculatePortfolioValue(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
}

/**
 * Calculate weighted average return across portfolio
 * @returns Percentage as decimal (e.g., 8.5 for 8.5%) or null if no holdings
 */
export function calculateWeightedReturn(
  assets: Asset[],
  products: Product[],
  portfolioValue: number
): number | null {
  if (portfolioValue <= 0) return null;

  const weightedSum = assets.reduce((sum, asset) => {
    const product = products.find((p) => p.id === asset.productId);
    if (!product) return sum;

    const weight = asset.currentValue / portfolioValue;
    return sum + weight * product.annualReturn;
  }, 0);

  return parseFloat(weightedSum.toFixed(2));
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
export function calculateAverageFunded(goals: Goal[]): number {
  if (goals.length === 0) return 0;

  const totalFundedPct = goals.reduce((sum, goal) => {
    const fundedPct = Math.min((goal.currentSaved / goal.targetAmount) * 100, 100);
    return sum + fundedPct;
  }, 0);

  return Math.round(totalFundedPct / goals.length);
}
