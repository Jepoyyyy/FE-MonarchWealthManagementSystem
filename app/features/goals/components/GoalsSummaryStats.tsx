import { Wallet, TrendingDown, DollarSign, Target, TrendingUp } from "lucide-react";
import type { FinancialProfile } from "~/types";
import { fmt } from "~/utils";
import { StatCard } from "~/features/dashboard/components/StatCard";

interface GoalsSummaryStatsProps {
  finProfile: FinancialProfile;
  totalExpenses: number;
  surplus: number;
  unallocated: number;
  avgFunded: number;
  portfolioReturn: number | null;
}

export function GoalsSummaryStats({
  finProfile,
  totalExpenses,
  surplus,
  unallocated,
  avgFunded,
  portfolioReturn,
}: GoalsSummaryStatsProps) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      <StatCard
        label="Monthly Income"
        value={fmt(finProfile.monthlyIncome)}
        icon={<Wallet size={16} />}
      />
      <StatCard
        label="Monthly Expenses"
        value={fmt(totalExpenses)}
        icon={<TrendingDown size={16} />}
      />
      <StatCard
        label="Investable Surplus"
        value={fmt(Math.max(surplus, 0))}
        sub={surplus < 0 ? "Deficit — review expenses" : `${fmt(unallocated)} unallocated`}
        icon={<DollarSign size={16} />}
        trend={surplus >= 0 ? (unallocated >= 0 ? "up" : "down") : "down"}
      />
      <StatCard
        label="Goals Progress"
        value={`${avgFunded}%`}
        sub="avg. funded"
        icon={<Target size={16} />}
        trend="up"
      />
      <StatCard
        label="Portfolio Return"
        value={portfolioReturn !== null ? `${portfolioReturn}%` : "—"}
        sub={portfolioReturn !== null ? "weighted avg. · live" : "No holdings yet"}
        icon={<TrendingUp size={16} />}
        trend={portfolioReturn !== null ? "up" : "neutral"}
      />
    </div>
  );
}
