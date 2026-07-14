import { useMemo } from "react";
import { DollarSign, Users, Layers, Activity } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AppUser, Product, Asset, AuditLog, Goal } from "~/types";
import { fmt, fmtDate, genHistory, categoryBadge } from "~/utils";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Badge } from "~/components/ui/Badge";

interface AdminDashboardViewProps {
  users: AppUser[];
  products: Product[];
  assets: Asset[];
  logs: AuditLog[];
}

export function AdminDashboardView({ users, products, assets, logs }: AdminDashboardViewProps) {
  const totalAUM = assets.reduce((s, a) => s + a.currentValue, 0);
  const activeUsers = users.filter((u) => u.role === "user" && u.status === "active").length;
  const visibleProducts = products.filter((p) => p.visible).length;
  const recentLogs = logs.slice(0, 5);

  const profileDist = [
    { name: "Risk Averse", value: users.filter((u) => u.riskProfile === "risk_averse").length, color: "#10b981" },
    { name: "Moderate", value: users.filter((u) => u.riskProfile === "moderate").length, color: "#f59e0b" },
    { name: "Risk Taker", value: users.filter((u) => u.riskProfile === "risk_taker").length, color: "#ef4444" },
  ];

  const aumHistory = useMemo(() => genHistory(totalAUM || 200000000), [totalAUM]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" subtitle="Platform-wide metrics and activity" />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Total AUM" value={fmt(totalAUM)} sub="under management" icon={<DollarSign size={16} />} trend="up" />
        <StatCard label="Active Users" value={String(activeUsers)} sub={`${users.filter((u) => u.role === "user").length} total`} icon={<Users size={16} />} trend="up" />
        <StatCard label="Active Products" value={String(visibleProducts)} sub={`${products.length} total`} icon={<Layers size={16} />} trend="neutral" />
        <StatCard label="Audit Events" value={String(logs.length)} sub="all time" icon={<Activity size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
          <h3 className="font-semibold mb-1 text-foreground">AUM Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Total assets under management</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={aumHistory}>
              <defs>
                <linearGradient id="adminAumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b8860b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7a8f" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7a8f" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmt(v).replace("IDR ", "")}
                width={60}
              />
              <Tooltip
                formatter={(v: any) => [fmt(v), "AUM"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="value" stroke="#b8860b" strokeWidth={2} fill="url(#adminAumGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <h3 className="font-semibold mb-4 text-foreground">Risk Profile Distribution</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={profileDist}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                stroke="none"
              >
                {profileDist.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-3">
            {profileDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span
                  className="font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <h3 className="font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-2 border-b border-border last:border-0"
            >
              <div className="mt-0.5">
                <Badge className={categoryBadge(log.category)}>{log.category}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{log.action.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground truncate">{log.details}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="text-xs text-muted-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {log.userName}
                </p>
                <p className="text-xs text-muted-foreground">{fmtDate(log.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
