import { Star } from "lucide-react";
import type { Goal } from "~/types";
import { fmt } from "~/utils";

interface SurplusAllocationProps {
  surplus: number;
  totalAllocated: number;
  unallocated: number;
  isAutoAlloc: boolean;
  priorityGoal?: Goal;
  primaryPct: number;
  otherGoals: Goal[];
  goals: Goal[];
  handleAutoAlloc: (pct: number) => void;
}

export function SurplusAllocation({
  surplus,
  totalAllocated,
  unallocated,
  isAutoAlloc,
  priorityGoal,
  primaryPct,
  otherGoals,
  goals,
  handleAutoAlloc,
}: SurplusAllocationProps) {
  return (
    <div className="mt-5 p-4 rounded-xl bg-muted">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Monthly Surplus Allocation
      </h4>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground">Investable surplus</span>
          <span className="font-semibold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            {fmt(Math.max(surplus, 0))}
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden bg-border">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${surplus > 0 ? Math.min((totalAllocated / surplus) * 100, 100) : 0}%`,
              background: unallocated < 0 ? "#ef4444" : "var(--primary)",
            }}
          />
        </div>

        {/* Auto-allocation */}
        {isAutoAlloc && surplus > 0 && priorityGoal && (
          <div className="mt-2 p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Star size={11} className="text-amber-500" />
                {priorityGoal.name} — primary allocation
              </label>
              <span className="text-xs font-bold" style={{ fontFamily: "var(--font-mono)", color: priorityGoal.color }}>
                {primaryPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={primaryPct}
              onChange={(e) => handleAutoAlloc(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between text-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityGoal.color }} />
                  {priorityGoal.name}
                </span>
                <span className="font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                  {fmt(priorityGoal.monthlyContribution)}
                </span>
              </div>
              {otherGoals.map((g) => (
                <div key={g.id} className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                    {g.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {fmt(g.monthlyContribution)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              Other goals split the remaining{" "}
              <span className="font-semibold">
                {fmt(Math.max(0, surplus - priorityGoal.monthlyContribution))}
              </span>{" "}
              equally ({fmt(Math.floor(Math.max(0, surplus - priorityGoal.monthlyContribution) / (otherGoals.length || 1)))}/ea)
            </p>
          </div>
        )}

        {/* Manual allocation */}
        {!isAutoAlloc &&
          goals.map((g) => (
            <div key={g.id} className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                {g.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {fmt(g.monthlyContribution)}
              </span>
            </div>
          ))}

        <div className="flex justify-between text-xs font-semibold border-t border-border pt-2">
          <span style={{ color: unallocated < 0 ? "#ef4444" : "var(--foreground)" }}>
            {goals.length === 0 ? "Not yet allocated" : "Unallocated"}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", color: unallocated < 0 ? "#ef4444" : "#10b981" }}>
            {unallocated >= 0 ? "+" : ""}
            {fmt(unallocated)}
          </span>
        </div>
      </div>
    </div>
  );
}
