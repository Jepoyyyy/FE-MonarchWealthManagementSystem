/**
 * Goal validation constraints
 * Matches backend DTO constraints in GoalRegistrationDTO.java and GoalEditingDTO.java
 */

// Target amount bounds
export const MAX_TARGET_AMOUNT = 100_000_000; // Rp 100,000,000 (100M)
export const MIN_TARGET_AMOUNT = 1;

// Monthly contribution bounds
export const MIN_MONTHLY_CONTRIBUTION = 0;
export const MAX_MONTHLY_CONTRIBUTION = 100_000_000; // Rp 100,000,000 (100M)

// Auto-allocation defaults
export const DEFAULT_PRIMARY_ALLOCATION_PCT = 50;
export const MIN_ALLOCATION_PCT = 10;
export const MAX_ALLOCATION_PCT = 90;

// Goal name constraints
export const MIN_GOAL_NAME_LENGTH = 1;
export const MAX_GOAL_NAME_LENGTH = 100;
