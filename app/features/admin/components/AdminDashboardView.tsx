import React, { useMemo, Suspense, useEffect, useState } from "react";
import { DollarSign, Users, Layers, Activity } from "lucide-react";
import type { AppUser, Product, Asset, AuditLog, Goal, AdminDashboardDTO } from "~/types";
import { fmt, fmtDate, genHistory, categoryBadge } from "~/utils";
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Badge } from '~/shared/components/Badge';
import { DashboardApi } from '~/features/dashboard/api';

const DashboardPerfChart = React.lazy(() => import("~/components/charts/DashboardPerfChart"));
const DashboardPieChart = React.lazy(() => import("~/components/charts/DashboardPieChart"));

interface AdminDashboardViewProps {
  users: AppUser[];
  products: Product[];
  assets: Asset[];
}

export function AdminDashboardView({ users, products, assets }: AdminDashboardViewProps) {
  const [dashData, setDashData] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await DashboardApi.getAdminDashboard();
        setDashData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalAUM = useMemo(() => {
    return dashData ? Number(dashData.aum) : assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  }, [dashData, assets]);

  const activeUsers = useMemo(() => {
    return dashData ? dashData.active_user_count : users.filter((u) => u.role === "user" && u.status === "active").length;
  }, [dashData, users]);

  const visibleProducts = useMemo(() => {
    return dashData ? dashData.active_product_count : products.filter((p) => p.visible).length;
  }, [dashData, products]);

  const recentLogs: any[] = [];

  const profileDist = useMemo(() => [
    { name: "Risk Averse", value: dashData?.risk_profiles?.risk_averse ?? users.filter((u) => u.riskProfile === "risk_averse").length, color: "#10b981" },
    { name: "Moderate", value: dashData?.risk_profiles?.moderate ?? users.filter((u) => u.riskProfile === "moderate").length, color: "#f59e0b" },
    { name: "Risk Taker", value: dashData?.risk_profiles?.risk_taker ?? users.filter((u) => u.riskProfile === "risk_taker").length, color: "#ef4444" },
  ], [dashData, users]);

  const aumHistory = useMemo(() => genHistory(totalAUM || 200000000), [totalAUM]);

  const perfData = useMemo(() => {
    if (dashData?.aum_trend) {
      const labels = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return dashData.aum_trend.map((d) => ({
        month: labels[d.month] ?? String(d.month),
        value: Number(d.value),
      }));
    }
    return aumHistory.map((d) => ({
      month: d.month,
      value: d.value,
    }));
  }, [dashData, aumHistory]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" subtitle="Platform-wide metrics and activity" />

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse flex gap-2 items-center text-muted-foreground">
             Loading dashboard...
          </div>
        </div>
      )}

      {!loading && <>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Total AUM" value={fmt(totalAUM)} sub="under management" icon={<DollarSign size={16} />} trend="up" />
        <StatCard label="Active Users" value={String(activeUsers)} sub={`${dashData ? dashData.user_count : users.filter((u) => u.role === "user").length} total`} icon={<Users size={16} />} trend="up" />
        <StatCard label="Active Products" value={String(visibleProducts)} sub={`${dashData ? dashData.product_count : products.length} total`} icon={<Layers size={16} />} trend="neutral" />
        <StatCard label="Audit Events" value={String(dashData ? dashData.total_audit_events : 0)} sub="all time" icon={<Activity size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPerfChart data={perfData} pnlPct={0} fmt={fmt} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPieChart data={profileDist} />
        </Suspense>
      </div>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <h3 className="font-semibold mb-4 text-foreground">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {recentLogs.map((log: any) => (
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
                <div className="text-right shrink-0">
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
      )}
      </>}
    </div>
  );
}
