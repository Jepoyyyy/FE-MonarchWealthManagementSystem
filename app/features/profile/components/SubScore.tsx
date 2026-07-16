import { useMemo } from "react";

interface SubScoreProps {
  label: string;
  score: number;
  max?: number;
  color: string;
}

export function SubScore({ label, score, max = 25, color }: SubScoreProps) {
  const pct = useMemo(() => Math.min(score / max, 1), [score, max]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ fontFamily: "var(--font-mono)", color }}>
          {score}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
