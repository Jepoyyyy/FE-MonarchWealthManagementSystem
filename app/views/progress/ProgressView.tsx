import React, { useState, useMemo, Suspense, useEffect } from "react";
import { Target, TrendingUp, Calendar, DollarSign, Percent, AlertTriangle, Wallet, Clock, BarChart3 } from "lucide-react";
import type { AppUser, Goal, Asset, Product, FinancialProfile } from "~/types";
import { fmt, fmtDate, genHistory, projectedDate, fmtPct, fmtDuration, fmtFull } from "~/utils";
import { GOAL_MAX_MONTHS, GOAL_TYPE_CONFIG } from "~/config/goals";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Badge } from "~/components/ui/Badge";
import { usePortfolioStore } from "~/stores/portfolioStore";

const ProgressGoalChart = React.lazy(() => import("~/components/charts/ProgressGoalChart"));

interface ProgressViewProps {
  user: AppUser;
  products: Product[];
  goals: Goal[];
  finProfile: FinancialProfile;
}

export function ProgressView({ user, products, goals, finProfile }: ProgressViewProps) {
  const { assets: myAssets, pnlData, fetchPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const totalValue = pnlData.reduce((s, a) => s + a.currentValue, 0);
  const totalCost = pnlData.reduce((s, a) => s + (a.units * a.avg_price), 0);
  const portfolioGain = totalValue - totalCost;

  const earliestMs =
    myAssets.length > 0
      ? Math.min(...myAssets.map((a) => new Date(a.purchaseDate).getTime()))
      : Date.now();
  const monthsHeld = Math.max(
    1,
    Math.round((Date.now() - earliestMs) / (1000 * 60 * 60 * 24 * 30.44))
  );
  const avgMonthlyIncome = portfolioGain / monthsHeld;

  const monthlyTarget = goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const performanceRatio = monthlyTarget > 0 ? (avgMonthlyIncome / monthlyTarget) * 100 : null;

  const perfStatus: "danger" | "warning" | "good" | null =
    performanceRatio === null
      ? null
      : performanceRatio < 70
      ? "danger"
      : performanceRatio < 100
      ? "warning"
      : "good";

  const perfConfig = {
    danger: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.25)",
      label: "Needs attention",
      sub: "Portfolio growth is covering less than 70% of your monthly savings targets.",
    },
    warning: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.25)",
      label: "On the way",
      sub: "Portfolio growth is partially covering your savings targets. Keep contributing.",
    },
    good: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
      label: "Performing well",
      sub: "Your portfolio's organic growth is meeting or exceeding your savings targets.",
    },
  };

  const goalETAs = goals.map((g) => {
    const remaining = g.targetAmount - totalValue;
    const etaMonths = avgMonthlyIncome > 0 ? Math.ceil(remaining / avgMonthlyIncome) : -1;
    return { goal: g, adjTarget: g.targetAmount, remaining, etaMonths };
  });

  const totalMonthlySavings =
    Object.values(finProfile.expenses).length > 0
      ? finProfile.monthlyIncome - (Object.values(finProfile.expenses) as number[]).reduce((a, b) => a + b, 0)
      : 0;

  const HORIZON = 60;
  const chartData = useMemo(() => {
    return Array.from({ length: HORIZON + 1 }, (_, i) => {
      const growthOnly = totalValue + avgMonthlyIncome * i;
      const r = avgMonthlyIncome > 0 && totalValue > 0 ? avgMonthlyIncome / totalValue : 0;
      let withSavings = totalValue;
      for (let m = 0; m < i; m++) {
        withSavings = withSavings * (1 + r) + Math.max(totalMonthlySavings, 0);
      }
      return {
        month: i,
        label: i === 0 ? "Now" : i % 12 === 0 ? `${i / 12}yr` : i === HORIZON ? `${HORIZON}mo` : undefined,
        growthOnly: Math.round(growthOnly),
        withSavings: Math.round(withSavings),
      };
    });
  }, [totalValue, avgMonthlyIncome, totalMonthlySavings]);

  const goalLines = goalETAs.filter((g) => g.etaMonths > 0 && g.etaMonths <= HORIZON);

  const retPct = totalCost > 0 ? (portfolioGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio Progress"
        subtitle="Tracking your portfolio's performance against your goals"
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Portfolio Value" value={fmt(totalValue)} icon={<Wallet size={16} />} />
        <StatCard
          label="Total Return"
          value={fmtPct(retPct)}
          sub={fmt(Math.abs(portfolioGain))}
          icon={<Percent size={16} />}
          trend={retPct >= 0 ? "up" : "down"}
        />
        <StatCard
          label="Avg Monthly Income"
          value={avgMonthlyIncome > 0 ? fmt(avgMonthlyIncome) : "—"}
          sub={`over ${monthsHeld} month${monthsHeld !== 1 ? "s" : ""}`}
          icon={<TrendingUp size={16} />}
          trend={avgMonthlyIncome >= 0 ? "up" : "down"}
        />
        <StatCard label="Portfolio Age" value={fmtDuration(monthsHeld)} sub="since first position" icon={<Clock size={16} />} trend="neutral" />
      </div>

      {perfStatus && (
        <div
          className="rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 border"
          style={{
            background: perfConfig[perfStatus].bg,
            borderColor: perfConfig[perfStatus].border,
          }}
        >
          <div className="shrink-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: perfConfig[perfStatus].color + "20" }}
            >
              <BarChart3 size={18} style={{ color: perfConfig[perfStatus].color }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-sm font-semibold" style={{ color: perfConfig[perfStatus].color }}>
                {perfConfig[perfStatus].label}
              </p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: perfConfig[perfStatus].color }}
              >
                {performanceRatio!.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{perfConfig[perfStatus].sub}</p>
          </div>
          <div className="shrink-0 text-right w-full md:w-auto mt-2 md:mt-0">
            <p className="text-xs text-muted-foreground mb-1">Portfolio income vs target</p>
            <div className="w-full md:w-40 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${Math.min(performanceRatio!, 100)}%`, background: perfConfig[perfStatus].color }}
              />
            </div>
            <p className="text-xs mt-1 text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {fmt(avgMonthlyIncome)}/mo <span className="mx-1">vs</span> {fmt(monthlyTarget)}/mo target
            </p>
          </div>
        </div>
      )}

      {/* Projection Chart */}
      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
        <ProgressGoalChart
          chartData={chartData}
          goalETAs={goalETAs}
          goalLines={goalLines}
          HORIZON={HORIZON}
          totalValue={totalValue}
          avgMonthlyIncome={avgMonthlyIncome}
          fmt={fmt}
          fmtFull={fmtFull}
        />
      </Suspense>

      {/* Per-goal ETA table */}
      {goals.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Goal Timeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Months to reach each goal = (Target − Current Portfolio) ÷ avg monthly portfolio income
            </p>
          </div>
          <table className="w-full text-sm min-w-125">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Goal", "Target", "Remaining", "ETA", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goalETAs.map(({ goal: g, adjTarget, remaining, etaMonths }) => {
                const reachable = etaMonths > 0 && etaMonths <= 1200;
                const rowStatus = !reachable ? "danger" : etaMonths > GOAL_MAX_MONTHS[g.type] ? "warning" : "good";
                const rowColor = { danger: "#ef4444", warning: "#f59e0b", good: "#10b981" }[rowStatus];
                return (
                  <tr
                    key={g.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span>{GOAL_TYPE_CONFIG[g.type].icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{g.name}</p>
                          {g.isPriority && (
                            <Badge variant="secondary">
                              Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3 text-xs font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmt(adjTarget)}
                    </td>
                    <td
                      className="px-5 py-3 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: remaining <= 0 ? "#10b981" : "var(--foreground)",
                      }}
                    >
                      {remaining <= 0 ? "Reached" : fmt(remaining)}
                    </td>
                    <td
                      className="px-5 py-3 text-xs font-bold"
                      style={{ fontFamily: "var(--font-mono)", color: rowColor }}
                    >
                      {remaining <= 0 ? "✓ Done" : reachable ? fmtDuration(etaMonths) : "Not reachable"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge style={{ background: rowColor + "15", color: rowColor, borderColor: rowColor + "40" }}>
                        {rowStatus === "good" ? "On track" : rowStatus === "warning" ? "Slow pace" : "Action needed"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Breakdown */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <h3 className="font-semibold mb-4 text-foreground">Position Breakdown</h3>
        <div className="flex flex-col gap-3">
          {pnlData.map((pnl) => {
            const p = products.find((pr) => pr.id === pnl.productId);
            if (!p) return null;
            const ret = pnl.potential_pnl_percent;
            const share = totalValue > 0 ? (pnl.currentValue / totalValue) * 100 : 0;
            return (
              <div key={pnl.assetId}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-2">
                    <ProductTypeBadge type={p.type} />
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-medium ${ret >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmtPct(ret)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--foreground)",
                        width: 80,
                        textAlign: "right",
                      }}
                    >
                      {fmt(pnl.currentValue)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${share}%`,
                      background: ret >= 0 ? "var(--chart-3)" : "var(--chart-5)",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {pnlData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No positions to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
