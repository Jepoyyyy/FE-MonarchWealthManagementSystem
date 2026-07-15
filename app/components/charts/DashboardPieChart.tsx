import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface DashboardPieChartProps {
  data: PieSlice[];
}

// ponytail: shared palette module when more charts appear

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
              <Cell key={entry.name} fill={entry.color || "#888"} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => [`${v}%`, "Allocation"]} />
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
