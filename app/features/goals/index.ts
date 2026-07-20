// Public API surface
export { GoalsView } from "./components/GoalsView";
export { GoalCard } from "./components/GoalCard";
export { GoalFormModal } from "./components/GoalFormModal";
export { useGoalsStore } from "./goals.store";
export { GoalApi } from "./api";
export * from "./goals.types";

// Re-export new components for internal use
export { GoalsSummaryStats } from "./components/GoalsSummaryStats";
export { EmptyGoalsState } from "./components/EmptyGoalsState";
export { PriorityGoalSection } from "./components/PriorityGoalSection";
export { OtherGoalsGrid } from "./components/OtherGoalsGrid";

// Hooks
export { usePortfolio } from "./hooks/usePortfolio";
export { useFinancialSummary } from "./hooks/useFinancialSummary";
export { useAutoAllocation } from "./hooks/useAutoAllocation";
export { useGoalOperations } from "./hooks/useGoalOperations";

// Constants & Calculations
export * from "./goals.constants";
export * from "./goals.calculations";

// Mappers & Validation
export { mapGoalToDto, validateGoalData } from "./goals.mappers";
