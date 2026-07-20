import { useMemo } from "react";
import type { Goal } from "~/types";
import { GoalApi } from "~/features/goals/api";
import { DEFAULT_PRIMARY_ALLOCATION_PCT } from "~/features/goals/goals.constants";
import { calculateAutoAllocation } from "~/features/goals/goals.calculations";

interface AutoAllocationState {
  isActive: boolean;
  priorityGoal: Goal | undefined;
  otherGoals: Goal[];
  primaryPct: number;
  calculateOtherGoalAmount: (otherGoalsCount: number) => number;
  applyAllocation: () => Promise<void>;
}

export function useAutoAllocation(
  goals: Goal[],
  surplus: number,
  onSuccess: () => Promise<void>,
  onError: (message: string) => void
): AutoAllocationState {
  const priorityGoal = useMemo(
    () => goals.find((g) => g.isPriority),
    [goals]
  );

  const otherGoals = useMemo(
    () => goals.filter((g) => !g.isPriority),
    [goals]
  );

  const isActive = useMemo(
    () => goals.length >= 2 && !!priorityGoal,
    [goals.length, priorityGoal]
  );

  const primaryPct = useMemo(() => {
    if (!isActive || surplus <= 0 || !priorityGoal) {
      return DEFAULT_PRIMARY_ALLOCATION_PCT;
    }
    return Math.round((priorityGoal.monthlyContribution / surplus) * 100);
  }, [isActive, surplus, priorityGoal]);

  const calculateOtherGoalAmount = (otherGoalsCount: number): number => {
    if (!isActive || surplus <= 0 || otherGoalsCount === 0) return 0;
    return calculateAutoAllocation(surplus, primaryPct, otherGoalsCount).otherGoalAmount;
  };

  const applyAllocation = async () => {
    try {
      await GoalApi.autoAllocate(primaryPct);
      await onSuccess();
    } catch (err: any) {
      onError(err.message || "Failed to allocate surplus");
    }
  };

  return {
    isActive,
    priorityGoal,
    otherGoals,
    primaryPct,
    calculateOtherGoalAmount,
    applyAllocation,
  };
}
