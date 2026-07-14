import { useMemo } from "react";
import { Wallet, DollarSign, TrendingUp, Briefcase, ArrowUpRight, ArrowDownRight, Layers, Star, ChevronRight } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AppUser, Product, Asset, View } from "~/types";
import { maxRiskForProfile, riskLabel, fmt, fmtPct, fmtFull, genHistory } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Badge } from "~/components/ui/Badge";
import { Btn } from "~/components/ui/Btn";

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
        <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Portfolio Performance</h3>
              <p className="text-xs text-muted-foreground">Jan – Jul 2024</p>
            </div>
            <Badge className={pnl >= 0 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}>
              {pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {fmtPct(pnlPct)}
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="dashPortfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0} />
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
                formatter={(v: any) => [fmtFull(v), "Value"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <Area type="monotone" dataKey="value" stroke="#1a3a5c" strokeWidth={2} fill="url(#dashPortfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <h3 className="font-semibold mb-4 text-foreground">Allocation</h3>
          {allocationData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [fmt(v), "Value"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-3">
                {allocationData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground truncate max-w-[110px]">{d.name}</span>
                    </div>
                    <span
                      className="font-medium text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {((d.value / totalValue) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-center">
              <div>
                <Briefcase size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No holdings yet</p>
                <Btn size="sm" variant="secondary" className="mt-3" onClick={() => onNavigate("/products")}>
                  Browse Products
                </Btn>
              </div>
            </div>
          )}
        </div>
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
