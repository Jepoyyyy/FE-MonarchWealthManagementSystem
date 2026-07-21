import { useCallback } from "react";
import type { Goal } from "~/types";
import { GoalApi } from "~/features/goals/api";
import { mapGoalToDto, validateGoalData } from "~/features/goals/goals.mappers";

interface GoalOperations {
  addGoal: (data: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, data: Omit<Goal, "id">) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setPriority: (id: string, goals: Goal[]) => Promise<void>;
}

export function useGoalOperations(
  fetchGoals: () => Promise<void>,
  onSuccess: (message: string, description?: string) => void,
  onError: (message: string, description?: string) => void
): GoalOperations {
  const addGoal = useCallback(
    async (data: Omit<Goal, "id">) => {
      // Client-side validation
      const validationError = validateGoalData(data);
      if (validationError) {
        onError("Validation failed", validationError);
        throw new Error(validationError);
      }

      try {
        await GoalApi.create(mapGoalToDto(data));
        onSuccess("Goal added", `"${data.name}" — target ${data.targetAmount}`);
        await fetchGoals();
      } catch (err: any) {
        onError("Failed to add goal", err.message);
        throw err;
      }
    },
    [fetchGoals, onSuccess, onError]
  );

  const updateGoal = useCallback(
    async (id: string, data: Omit<Goal, "id">) => {
      const validationError = validateGoalData(data);
      if (validationError) {
        onError("Validation failed", validationError);
        throw new Error(validationError);
      }

      try {
        await GoalApi.update(id, mapGoalToDto(data));
        onSuccess("Goal Updated Successfully", `"${data.name}"`);
        await fetchGoals();
      } catch (err: any) {
        onError("Fail to Update goal", err.message);
        throw err;
      }
    },
    [fetchGoals, onSuccess, onError]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        await GoalApi.delete(id);
        await fetchGoals();
        onSuccess("Goal Deleted Successfully");
      } catch (err: any) {
        onError("Fail to Delete goal", err.message);
      }
    },
    [fetchGoals, onSuccess, onError]
  );

  const setPriority = useCallback(
    async (id: string, goals: Goal[]) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      try {
        await GoalApi.update(id, mapGoalToDto({ ...goal, isPriority: true }));
        onSuccess("Priority goal Updated", `"${goal.name}" now become priority`);
        await fetchGoals();
      } catch (err: any) {
        onError("Fail to Update Priority", err.message);
      }
    },
    [fetchGoals, onSuccess, onError]
  );

  return { addGoal, updateGoal, deleteGoal, setPriority };
}
