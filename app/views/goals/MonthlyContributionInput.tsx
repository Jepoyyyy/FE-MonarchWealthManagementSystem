import { Calculator, AlertTriangle } from "lucide-react";
import { fmt } from "~/utils";

interface MonthlyContributionInputProps {
  monthly: string;
  setMonthly: (val: string) => void;
  surplus: number;
  monthlyIncome: number;
}

export function MonthlyContributionInput({
  monthly,
  setMonthly,
  surplus,
  monthlyIncome,
}: MonthlyContributionInputProps) {
  const parsedMonthly = parseFloat(monthly) || 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Monthly Contribution (IDR)
        </label>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {surplus > 0 && (
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {parsedMonthly > 0
                ? `${Math.round((parsedMonthly / monthlyIncome) * 100)}% of income`
                : "0% of income"}
            </span>
          )}
        </div>
      </div>
      {surplus > 0 && (
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={Math.max(surplus, parsedMonthly)}
            step={Math.max(Math.round(surplus / 100), 10000)}
            value={Math.min(parsedMonthly, Math.max(surplus, parsedMonthly))}
            onChange={(e) => setMonthly(e.target.value)}
            className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>IDR 0</span>
            <span className={parsedMonthly > surplus ? "text-red-500 font-medium" : ""}>
              {parsedMonthly > surplus
                ? `⚠ Exceeds surplus (${fmt(surplus)})`
                : `Surplus: ${fmt(surplus)}`}
            </span>
          </div>
        </div>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Calculator size={14} />
        </span>
        <input
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          placeholder="e.g. 2000000"
          className="w-full pl-9 pr-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{
            borderColor:
              monthlyIncome > 0 && parsedMonthly > monthlyIncome
                ? "var(--destructive)"
                : "var(--border)",
            background: "var(--input-background)",
            color: "var(--foreground)",
          }}
        />
      </div>
      {monthlyIncome > 0 && parsedMonthly > monthlyIncome && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={11} /> Contribution exceeds your full monthly income
          of {fmt(monthlyIncome)}.
        </p>
      )}
    </div>
  );
}
