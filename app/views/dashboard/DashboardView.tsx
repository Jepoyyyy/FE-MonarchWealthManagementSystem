import React, { useMemo, Suspense, useEffect, useState } from "react";
import { Wallet, DollarSign, TrendingUp, Briefcase, ChevronRight } from "lucide-react";
import type { AppUser, Product, View } from "~/types";
import type { UserDashboardDTO } from "~/types";
import { maxRiskForProfile, riskLabel, fmt, fmtPct, fmtFull } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Btn } from "~/components/ui/Btn";
import { DashboardApi } from "~/api/dashboard";
import { toast } from "sonner";

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
  const [dashData, setDashData] = useState<UserDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await DashboardApi.getUserDashboard();
        setDashData(res.data);
      } catch (err: any) {
        const msg = err?.message || "Failed to load dashboard";
        console.error("Dashboard error:", err);
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalValue = parseNum(dashData?.portofolio?.value);
  const totalCost = parseNum(dashData?.portofolio?.invested);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const assetCount = dashData?.portofolio?.holdings ?? 0;

  const perfData = useMemo(() => {
    const raw = dashData?.performance ?? [];
    // backend sends 0-padded months; take non-zero tail or all if no non-zero
    const lastNonZero = raw.reduce((acc, d, i) => (d.value > 0 ? i : acc), -1);
    const trimmed = lastNonZero >= 0 ? raw.slice(0, lastNonZero + 1) : raw;
    // map month number to label for the chart
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
      />

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse flex gap-2 items-center text-muted-foreground">
             Loading dashboard...
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-3 underline text-red-800 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !error && <>
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
          value={fmt(Math.abs(pnl))}
          sub={pnl >= 0 ? "Profit" : "Loss"}
          icon={<TrendingUp size={16} />}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <StatCard label="Holdings" value={String(assetCount)} sub="active positions" icon={<Briefcase size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Suspense fallback={<div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />}>
          {perfData.length > 0 && perfData.some((d) => d.value > 0) ? (
            <DashboardPerfChart data={perfData} pnlPct={pnlPct} fmt={fmtFull} />
          ) : (
            <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border flex items-center justify-center text-muted-foreground text-sm">
              Start investing to see your portfolio performance.
            </div>
          )}
        </Suspense>

        {/* Allocation Pie */}
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          {pieData.length > 0 && totalValue > 0 ? (
            <DashboardPieChart data={pieData} />
          ) : (
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border flex items-center justify-center text-muted-foreground text-sm">
              No assets yet.
            </div>
          )}
        </Suspense>
      </div>

            {/* Recommendations widget */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
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
