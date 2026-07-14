import React, { useMemo, Suspense } from "react";
import { DollarSign, Users, Layers, Activity } from "lucide-react";
import type { AppUser, Product, Asset, AuditLog, Goal } from "~/types";
import { fmt, fmtDate, genHistory, categoryBadge } from "~/utils";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Badge } from "~/components/ui/Badge";

const DashboardPerfChart = React.lazy(() => import("~/components/charts/DashboardPerfChart"));
const DashboardPieChart = React.lazy(() => import("~/components/charts/DashboardPieChart"));

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
        <Suspense fallback={<div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPerfChart data={aumHistory} pnlPct={0} fmt={fmt} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPieChart data={profileDist} />
        </Suspense>
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
