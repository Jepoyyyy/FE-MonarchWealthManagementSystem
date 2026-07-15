import React, { useMemo, Suspense } from "react";
import { Wallet, DollarSign, TrendingUp, Briefcase, ChevronRight } from "lucide-react";
import type { AppUser, Product, Asset, View } from "~/types";
import { maxRiskForProfile, riskLabel, fmt, fmtPct, fmtFull, genHistory } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Btn } from "~/components/ui/Btn";
import { DashboardApi } from "~/api/dashboard";
import { useEffect, useState } from "react";
import { AssetApi } from "~/api/assets";

const DashboardPerfChart = React.lazy(() => import("~/components/charts/DashboardPerfChart"));
const DashboardPieChart = React.lazy(() => import("~/components/charts/DashboardPieChart"));

interface DashboardViewProps {
  user: AppUser;
  products: Product[];
  onNavigate: (v: View | string) => void;
}

export function DashboardView({ user, products, onNavigate }: DashboardViewProps) {
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // We still need the user's active assets to render the PieChart
  const [myAssets, setMyAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, assetsRes] = await Promise.all([
           DashboardApi.getUserDashboard(),
           AssetApi.list()
        ]);
        setDashData(dashRes.data);
        setMyAssets(assetsRes.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalValue = dashData ? dashData.totalAssets : 0;
  const totalCost = dashData ? dashData.totalInvested : 0;
  const pnl = dashData ? dashData.pnl : 0;
  const pnlPct = dashData ? dashData.pnlPercent : 0;
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

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse flex gap-2 items-center text-muted-foreground">
             Loading dashboard...
          </div>
        </div>
      )}
      {!loading && <>
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
        <StatCard label="Holdings" value={String(dashData ? dashData.assetCount : myAssets.length)} sub="active positions" icon={<Briefcase size={16} />} trend="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Suspense fallback={<div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />}>
          <DashboardPerfChart data={dashData?.recentTransactions ? genHistory(totalValue || 50000000) : history} pnlPct={pnlPct} fmt={fmtFull} />
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
      </>}
    </div>
  );
}
