import type { Goal, GoalRegistrationDTO } from "~/types";
import { fmt } from "~/utils";
import {
  MAX_TARGET_AMOUNT,
  MIN_TARGET_AMOUNT,
  MAX_MONTHLY_CONTRIBUTION,
  MIN_MONTHLY_CONTRIBUTION,
  MIN_GOAL_NAME_LENGTH,
  MAX_GOAL_NAME_LENGTH,
} from "./goals.constants";

/**
 * Map frontend Goal to GoalRegistrationDTO for API submission
 * Single source of truth for DTO transformation
 */
export function mapGoalToDto(goal: Omit<Goal, "id">): GoalRegistrationDTO {
  return {
    name: goal.name,
    type: goal.type,
    targetAmount: goal.targetAmount,
    currentSaved: goal.currentSaved,
    monthlyContribution: goal.monthlyContribution,
    priority: goal.isPriority ? "HIGH" : "MEDIUM",
    isPriority: goal.isPriority,
    color: goal.color,
  };
}

/**
 * Validate goal data before API call
 * Mirrors backend constraints
 * 
 * @returns Error message if validation fails, null if valid
 */
export function validateGoalData(data: Omit<Goal, "id">): string | null {
  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    return "Goal name is required";
  }
  if (data.name.length < MIN_GOAL_NAME_LENGTH) {
    return `Goal name must be at least ${MIN_GOAL_NAME_LENGTH} characters`;
  }
  if (data.name.length > MAX_GOAL_NAME_LENGTH) {
    return `Goal name cannot exceed ${MAX_GOAL_NAME_LENGTH} characters`;
  }

  // Target amount validation
  if (data.targetAmount < MIN_TARGET_AMOUNT) {
    return `Target amount must be at least ${fmt(MIN_TARGET_AMOUNT)}`;
  }
  if (data.targetAmount > MAX_TARGET_AMOUNT) {
    return `Target amount cannot exceed ${fmt(MAX_TARGET_AMOUNT)}`;
  }

  // Monthly contribution validation
  if (data.monthlyContribution < MIN_MONTHLY_CONTRIBUTION) {
    return `Monthly contribution cannot be negative`;
  }
  if (data.monthlyContribution > MAX_MONTHLY_CONTRIBUTION) {
    return `Monthly contribution cannot exceed ${fmt(MAX_MONTHLY_CONTRIBUTION)}`;
  }

  // Current saved validation
  if (data.currentSaved < 0) {
    return "Current saved amount cannot be negative";
  }
  if (data.currentSaved > data.targetAmount) {
    return "Current saved cannot exceed target amount";
  }

  return null; // Valid
}
