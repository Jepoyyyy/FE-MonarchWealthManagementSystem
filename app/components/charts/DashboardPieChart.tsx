import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface DashboardPieChartProps {
  data: PieSlice[];
}

const FALLBACK_COLORS = ["#1a3a5c", "#b8860b", "#2d6a4f", "#7b2d8b", "#d97706", "#dc2626", "#2563eb", "#059669"];

export default function DashboardPieChart({ data }: DashboardPieChartProps) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Portfolio Composition</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => [`IDR ${v.toLocaleString()}`, "Value"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <div className="w-2 h-2 rounded-full" style={{ background: entry.color || "#888" }} />
              {entry.name}
            </span>
            <span className="font-medium text-foreground">
              {entry.value.toLocaleString()}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
