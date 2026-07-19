import type { Goal, GoalAnalysis } from "~/types";
import { GOAL_MAX_MONTHS, GOAL_FAST_MONTHS, GOAL_TYPE_CONFIG } from '~/features/goals/goals.config';
import { monthsToGoal, monthlyNeeded, fmt, projectedDate, fmtDuration } from "~/utils";

export const analyzeGoal = (goal: Goal, effectiveCurrentSaved?: number): GoalAnalysis => {
  const saved = effectiveCurrentSaved ?? goal.currentSaved;

  const months = monthsToGoal(goal.targetAmount, saved, goal.monthlyContribution);

  if (saved >= goal.targetAmount) {
    return { status: "reached", months: 0, headline: "Goal reached!", detail: "You've fully funded this goal. Consider redirecting contributions elsewhere." };
  }
  if (months < 0) {
    return { status: "no_contribution", months: -1, headline: "No path to this goal", detail: "You have no monthly contribution set. Add one to start making progress." };
  }

  const maxM = GOAL_MAX_MONTHS[goal.type];
  const fastM = GOAL_FAST_MONTHS[goal.type];

  if (months > maxM) {
    const needed = monthlyNeeded(goal.targetAmount, saved, maxM);
    return {
      status: "too_little",
      months,
      headline: "You are saving too little",
      detail: `At ${fmt(goal.monthlyContribution)}/mo, this ${GOAL_TYPE_CONFIG[goal.type].label.toLowerCase()} goal takes ${fmtDuration(months)} — longer than the recommended ${fmtDuration(maxM)}. You need ${fmt(needed)}/mo to stay on track.`,
      suggestedMonthly: needed,
    };
  }

  if (months <= fastM) {
    return {
      status: "ahead",
      months,
      headline: `Almost there — ${fmtDuration(months)} to go`,
      detail: `Great pace! You're ahead of schedule and should reach this goal by ${projectedDate(months)}. Consider whether surplus can go toward another goal.`,
    };
  }

  return {
    status: "on_track",
    months,
    headline: `On track — ${fmtDuration(months)} remaining`,
    detail: `You'll reach this goal by ${projectedDate(months)} at your current contribution rate.`,
  };
};
