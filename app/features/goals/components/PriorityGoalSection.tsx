import { Star } from "lucide-react";
import type { Goal, Asset } from "~/types";
import { GoalCard } from "~/features/goals/components/GoalCard";

interface PriorityGoalSectionProps {
  goal: Goal;
  surplus: number;
  assignedAssets: Asset[];
  onSetPriority: (id: string) => Promise<void>;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => Promise<void>;
}

export function PriorityGoalSection({
  goal,
  surplus,
  assignedAssets,
  onSetPriority,
  onEdit,
  onDelete,
}: PriorityGoalSectionProps) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Star size={12} className="text-amber-500" /> Priority Goal
      </h3>
      <GoalCard
        goal={goal}
        surplus={surplus}
        assignedAssets={assignedAssets}
        onSetPriority={onSetPriority}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
