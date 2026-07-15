import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardPerfChartProps {
  data: { month: string; value: number }[];
  pnlPct: number | undefined | null;
  fmt: (v: number) => string;
}

export default function DashboardPerfChart({ data, pnlPct, fmt }: DashboardPerfChartProps) {
  const safePnlPct = pnlPct ?? 0;
  return (
    <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Portfolio Performance</h3>
          <p className="text-xs text-muted-foreground">Jan 2024 – Present</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
            safePnlPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {safePnlPct >= 0 ? "+" : ""}{safePnlPct.toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dashPortfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => fmt(v).replace("IDR", "Rp")} width={60} tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: any) => [fmt(v), "Value"]} />
          <Area type="monotone" dataKey="value" stroke="#1a3a5c" strokeWidth={2} fill="url(#dashPortfolioGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
