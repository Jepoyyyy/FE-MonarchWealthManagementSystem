import { ComposedChart, Area, Line, ReferenceLine, ReferenceDot, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressGoalChartProps {
  chartData: { month: number; growthOnly: number; withSavings: number }[];
  goalETAs: { goal: any; adjTarget: number; remaining: number; etaMonths: number }[];
  goalLines: { goal: any; adjTarget: number; remaining: number; etaMonths: number }[];
  HORIZON: number;
  totalValue: number;
  avgMonthlyIncome: number;
  fmt: (val: number) => string;
  fmtFull: (val: number) => string;
}

export default function ProgressGoalChart({
  chartData,
  goalETAs,
  goalLines,
  HORIZON,
  totalValue,
  avgMonthlyIncome,
  fmt,
  fmtFull,
}: ProgressGoalChartProps) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Goal Projection — 60-Month Horizon</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on avg monthly income of {fmt(avgMonthlyIncome)}. Dashed lines show when your portfolio reaches each goal.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-primary" />
            Growth only
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-accent" />
            With savings
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#6b7a8f" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v % 12 === 0 ? `${v === 0 ? "Now" : v / 12 + "yr"}` : "")}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6b7a8f" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => fmt(v).replace("IDR ", "")}
            width={68}
          />
          <Tooltip
            formatter={(v: any, name: any) => [
              fmtFull(v),
              name === "growthOnly" ? "Growth only" : "With savings",
            ]}
            labelFormatter={(l) => `Month ${l}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
          />
          {goalETAs
            .filter((g) => g.adjTarget <= chartData[HORIZON].withSavings * 1.5)
            .map(({ goal: g, adjTarget }) => (
              <ReferenceLine
                key={g.id}
                y={adjTarget}
                stroke={g.color}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: g.name,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: g.color,
                  fontWeight: 600,
                }}
              />
            ))}
          {goalLines.map(({ goal: g, etaMonths }) => (
            <ReferenceDot
              key={`dot-${g.id}`}
              x={etaMonths}
              y={Math.round(totalValue + avgMonthlyIncome * etaMonths)}
              r={5}
              fill={g.color}
              stroke="white"
              strokeWidth={2}
            />
          ))}
          <Area
            type="monotone"
            dataKey="growthOnly"
            stroke="#1a3a5c"
            strokeWidth={2}
            fill="#1a3a5c"
            fillOpacity={0.08}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="withSavings"
            stroke="#b8860b"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
