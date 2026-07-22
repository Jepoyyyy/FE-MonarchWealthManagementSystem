import { Target } from "lucide-react";
import type { Goal, Asset } from "~/types";
import { GoalCard } from "~/features/goals/components/GoalCard";

interface OtherGoalsGridProps {
  goals: Goal[];
  hasPriorityGoal: boolean;
  surplus: number;
  userAssets: Asset[];
  onSetPriority: (id: string) => Promise<void>;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => Promise<void>;
}

export function OtherGoalsGrid({
  goals,
  hasPriorityGoal,
  surplus,
  userAssets,
  onSetPriority,
  onEdit,
  onDelete,
}: OtherGoalsGridProps) {
  if (goals.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Target size={12} /> {hasPriorityGoal ? "Other Goals" : "Your Goals"}
      </h3>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            surplus={surplus}
            assignedAssets={userAssets.filter((a) => a.goalId === goal.id)}
            onSetPriority={onSetPriority}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
