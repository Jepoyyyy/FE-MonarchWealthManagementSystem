import { useMemo } from "react";
import type { FinancialProfile, Goal } from "~/types";

interface FinancialSummary {
  totalExpenses: number;
  surplus: number;
  totalAllocated: number;
  unallocated: number;
}

export function useFinancialSummary(
  finProfile: FinancialProfile,
  goals: Goal[]
): FinancialSummary {
  const totalExpenses = useMemo(
    () => Object.values(finProfile.expenses).reduce((a, b) => a + b, 0),
    [finProfile.expenses]
  );

  const surplus = useMemo(
    () => finProfile.monthlyIncome - totalExpenses,
    [finProfile.monthlyIncome, totalExpenses]
  );

  const totalAllocated = useMemo(
    () => goals.reduce((sum, g) => sum + g.monthlyContribution, 0),
    [goals]
  );

  const unallocated = useMemo(
    () => surplus - totalAllocated,
    [surplus, totalAllocated]
  );

  return { totalExpenses, surplus, totalAllocated, unallocated };
}
