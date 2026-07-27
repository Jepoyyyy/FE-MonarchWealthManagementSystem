import React, { useMemo, Suspense, useEffect, useState } from "react";
import { Wallet, DollarSign, TrendingUp, Briefcase, ChevronRight, RotateCw } from "lucide-react";
import type { AppUser, Product, View } from "~/types";
import { maxRiskForProfile, riskLabel, fmt, fmtPct, fmtFull } from "~/utils";
import { ProductTypeBadge } from '~/features/products/components/ProductTypeBadge';
import { RiskLevelBadge } from '~/features/profile/components/RiskLevelBadge';
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Btn } from '~/shared/components/Button';
import { useDashboardStore } from '~/features/dashboard/dashboard.store';
import { toast } from "sonner";
import { ConfirmModal } from '~/shared/components/ConfirmModal';

const DashboardPerfChart = React.lazy(() => import("~/components/charts/DashboardPerfChart"));
const DashboardPieChart = React.lazy(() => import("~/components/charts/DashboardPieChart"));

interface DashboardViewProps {
  user: AppUser;
  products: Product[];
  onNavigate: (v: View | string) => void;
}

const PIE_COLORS = ["#1a3a5c", "#b8860b", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];

function parseNum(v: number | string | undefined | null): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(v) || 0;
}

export function DashboardView({ user, products, onNavigate }: DashboardViewProps) {
  const dashData = useDashboardStore((s) => s.dashData);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboard(true);
      toast.success("Dashboard refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalValue = parseNum(dashData?.portofolio?.value);
  const totalCost = parseNum(dashData?.portofolio?.invested);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const assetCount = dashData?.portofolio?.holdings ?? 0;

  const perfData = useMemo(() => {
    const raw = dashData?.performance ?? [];
    const lastNonZero = raw.reduce((acc, d, i) => (d.value > 0 ? i : acc), -1);
    const trimmed = lastNonZero >= 0 ? raw.slice(0, lastNonZero + 1) : raw;
    const labels = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return trimmed.map((d) => ({ month: labels[d.month] ?? String(d.month), value: d.value }));
  }, [dashData]);

  const maxRisk = maxRiskForProfile(user.riskProfile, false);
  const recommended = useMemo(
    () => products.filter((p) => p.visible && p.riskLevel <= maxRisk).slice(0, 4),
    [products, maxRisk]
  );

  const pieData = useMemo(() => {
    const items = dashData?.portofolio?.items ?? [];
    return items.map((item, i) => ({
      name: item.name,
      value: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [dashData, totalValue]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${user.name.split(" ")[0]}.`}
        subtitle={`${new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        action={
          <Btn
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh data"
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} /> Refresh
          </Btn>
        }
      />

      {loading && !dashData && (
        <div className="space-y-6" data-testid="dashboard-loading">
          {/* Skeleton stat cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3"></div>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
          {/* Skeleton charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-card border border-border rounded-xl animate-pulse"></div>
            <div className="h-64 bg-card border border-border rounded-xl animate-pulse"></div>
          </div>
        </div>
      )}
      {error && !dashData && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm" data-testid="dashboard-error">
          {error}
          <button
            onClick={() => fetchDashboard(true)}
            className="ml-3 underline text-red-800 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      {(dashData || (!loading && !error)) && <>
      {/* Stats grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard
          label="Portfolio Value"
          value={fmt(totalValue)}
          sub={`${fmtPct(pnlPct)} all time`}
          icon={<Wallet size={16} />}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <StatCard label="Total Invested" value={fmt(totalCost)} icon={<DollarSign size={16} />} />
        <StatCard
          label="Unrealized P&L"
          value={fmt(pnl)}
          sub={pnl >= 0 ? "Profit" : "Loss"}
          icon={<TrendingUp size={16} />}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <StatCard label="Holdings" value={String(assetCount)} sub="active positions" icon={<Briefcase size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart with isolated Suspense */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl border border-border" />}>
            {perfData.length > 0 && perfData.some((d) => d.value > 0) ? (
              <DashboardPerfChart data={perfData} pnlPct={pnlPct} fmt={fmtFull} />
            ) : (
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border flex items-center justify-center text-muted-foreground text-sm h-64">
                Start investing to see your portfolio performance.
              </div>
            )}
          </Suspense>
        </div>

        {/* Allocation Pie with isolated Suspense */}
        <div>
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl border border-border" />}>
            {pieData.length > 0 && totalValue > 0 ? (
              <DashboardPieChart data={pieData} />
            ) : (
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border flex flex-col justify-between min-h-[320px]">
                <h3 className="font-semibold text-foreground">Portfolio Composition</h3>
                <div className="flex flex-col items-center justify-center text-center gap-3 my-auto py-6">
                  <p className="text-sm text-muted-foreground">No assets in portfolio yet.</p>
                  <Btn size="sm" variant="primary" onClick={() => onNavigate("/products")}>
                    Browse Products <ChevronRight size={14} />
                  </Btn>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>

      {/* Recommendations widget */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border" data-testid="recommended-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Recommended for You</h3>
            <p className="text-xs text-muted-foreground">Based on your {riskLabel(user.riskProfile)} profile</p>
          </div>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate("/products")}>
            View All <ChevronRight size={14} />
          </Btn>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {recommended.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate("/products")}
              className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer bg-muted"
            >
              <div className="flex items-center justify-between mb-2">
                <ProductTypeBadge type={p.type} />
                <RiskLevelBadge level={p.riskLevel} />
              </div>
              <p
                className="text-sm font-semibold leading-tight mb-1 text-foreground"
              >
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{p.issuer}</p>
              <p
                className="text-base font-bold text-accent"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {p.annualReturn}%
              </p>
              <p className="text-xs text-muted-foreground">annual return</p>
            </div>
          ))}
        </div>
      </div>
      </>}
    </div>
  );
}

