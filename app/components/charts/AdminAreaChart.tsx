import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminAreaChartProps {
  data: { month: string; users: number; products: number }[];
}

export default function AdminAreaChart({ data }: AdminAreaChartProps) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4">User & Product Growth</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="users" stroke="#1a3a5c" strokeWidth={2} fill="#1a3a5c" fillOpacity={0.1} />
          <Area type="monotone" dataKey="products" stroke="#b8860b" strokeWidth={2} fill="#b8860b" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
