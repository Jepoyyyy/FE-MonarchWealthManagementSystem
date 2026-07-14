import React, { useMemo, Suspense } from "react";
import { Wallet, DollarSign, TrendingUp, Briefcase, ChevronRight } from "lucide-react";
import type { AppUser, Product, Asset, View } from "~/types";
import { maxRiskForProfile, riskLabel, fmt, fmtPct, fmtFull, genHistory } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Btn } from "~/components/ui/Btn";

const DashboardPerfChart = React.lazy(() => import("~/components/charts/DashboardPerfChart"));
const DashboardPieChart = React.lazy(() => import("~/components/charts/DashboardPieChart"));

interface DashboardViewProps {
  user: AppUser;
  products: Product[];
  assets: Asset[];
  onNavigate: (v: View | string) => void;
}

export function DashboardView({ user, products, assets, onNavigate }: DashboardViewProps) {
  const myAssets = assets.filter((a) => a.userId === user.id);
  const totalValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const totalCost = myAssets.reduce((s, a) => s + a.amount, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const history = useMemo(() => genHistory(totalValue || 50000000), [totalValue]);

  const maxRisk = maxRiskForProfile(user.riskProfile, false);
  const recommended = products.filter((p) => p.visible && p.riskLevel <= maxRisk).slice(0, 4);

  const allocationData = myAssets.map((a) => {
    const p = products.find((pr) => pr.id === a.productId);
    return { name: p?.name.split("–")[0].trim() ?? "Unknown", value: a.currentValue, type: p?.type };
  });

  const PIE_COLORS = ["#1a3a5c", "#b8860b", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];

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
        <StatCard label="Holdings" value={String(myAssets.length)} sub="active positions" icon={<Briefcase size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Suspense fallback={<div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPerfChart data={history} pnlPct={pnlPct} fmt={fmtFull} />
        </Suspense>

        {/* Allocation Pie */}
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPieChart
            data={allocationData.map((d, i) => ({
              name: d.name,
              value: Math.round((d.value / totalValue) * 100),
              color: PIE_COLORS[i % PIE_COLORS.length],
            }))}
          />
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
    </div>
  );
}
