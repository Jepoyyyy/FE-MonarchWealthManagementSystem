import { Plus, Target } from "lucide-react";
import { Btn } from "~/shared/components/Button";

interface EmptyGoalsStateProps {
  onCreateGoal: () => void;
}

export function EmptyGoalsState({ onCreateGoal }: EmptyGoalsStateProps) {
  return (
    <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 text-center">
      <Target size={40} className="text-muted-foreground mb-3" />
      <p className="font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
        No goals yet
      </p>
      <p className="text-sm text-muted-foreground mt-1 mb-5">
        Set your first financial goal and let the calculator show you how to get there.
      </p>
      <Btn onClick={onCreateGoal}>
        <Plus size={14} /> Create First Goal
      </Btn>
    </div>
  );
}
