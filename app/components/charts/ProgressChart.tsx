import { ComposedChart, Area, Line, ReferenceLine, ReferenceDot, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressChartProps {
  data: { month: string; value: number; target: number }[];
  targetAmount: number;
  fmt: (v: number) => string;
}

export default function ProgressChart({ data, targetAmount, fmt }: ProgressChartProps) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Historical Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="progressAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b8860b" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => fmt(v).replace("IDR", "Rp")} width={60} tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: any) => [fmt(v), "Value"]} />
          <ReferenceLine y={targetAmount} stroke="#16a34a" strokeDasharray="6 3" label={{ value: "Target", position: "insideTopRight", fontSize: 11, fill: "#16a34a" }} />
          <Area type="monotone" dataKey="value" stroke="#b8860b" strokeWidth={2} fill="url(#progressAreaGrad)" />
          {data.filter((d) => d.month === data[data.length - 1]?.month).map((d) => (
            <ReferenceDot key="last" x={d.month} y={d.value} r={5} fill="#b8860b" stroke="white" strokeWidth={2} />
          ))}
          <Line type="monotone" dataKey="target" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
