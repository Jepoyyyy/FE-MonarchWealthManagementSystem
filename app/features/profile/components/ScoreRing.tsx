import { useMemo } from "react";

interface ScoreRingProps {
  score: number;
}

export function ScoreRing({ score }: ScoreRingProps) {
  const r = 52;
  const circ = useMemo(() => 2 * Math.PI * r, [r]);
  const filled = useMemo(() => Math.min(score / 100, 1) * circ, [score, circ]);
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Healthy" : score >= 45 ? "Fair" : "Needs work";

  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle cx="68" cy="68" r={r} fill="none" stroke="var(--muted)" strokeWidth="11" />
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="11"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 68 68)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="68"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="30"
        fontWeight="700"
        fill={color}
        fontFamily="var(--font-mono)"
      >
        {score}
      </text>
      <text
        x="68"
        y="82"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fill="var(--muted-foreground)"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </svg>
  );
}
