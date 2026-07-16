import { Calculator, DollarSign, Check } from "lucide-react";
import type { Goal, FinancialProfile } from "~/types";
import { fmt } from "~/utils";
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';
import { SurplusAllocation } from "./SurplusAllocation";

interface WealthCalculatorProps {
  surplus: number;
  totalExpenses: number;
  portfolioReturn: number | null;
  finProfile: FinancialProfile;
  calcDraft: FinancialProfile | null;
  updateIncome: (val: string) => void;
  updateExpense: (key: string, val: string) => void;
  handleSaveCalc: () => void;
  
  // SurplusAllocation dependencies
  totalAllocated: number;
  unallocated: number;
  isAutoAlloc: boolean;
  priorityGoal?: Goal;
  primaryPct: number;
  otherGoals: Goal[];
  goals: Goal[];
  handleAutoAlloc: (pct: number) => void;
}

const EXPENSE_LABELS: Record<string, string> = {
  housing: "Housing / Rent",
  food: "Food & Groceries",
  transport: "Transport",
  utilities: "Utilities",
  healthcare: "Healthcare",
  entertainment: "Entertainment",
  insurance: "Insurance",
  other: "Other",
};

export function WealthCalculator({
  surplus,
  portfolioReturn,
  finProfile,
  calcDraft,
  updateIncome,
  updateExpense,
  handleSaveCalc,
  totalAllocated,
  unallocated,
  isAutoAlloc,
  priorityGoal,
  primaryPct,
  otherGoals,
  goals,
  handleAutoAlloc,
}: WealthCalculatorProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-primary" />
          <h3 className="font-semibold text-foreground">Wealth Calculator</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Surplus available to invest:</span>
          <span
            className={`font-bold text-sm ${surplus >= 0 ? "text-emerald-600" : "text-red-500"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {surplus >= 0 ? "+" : ""}
            {fmt(surplus)}/mo
          </span>
          <Btn size="sm" onClick={handleSaveCalc} disabled={!calcDraft}>
            <Check size={14} /> Simpan
          </Btn>
        </div>
      </div>
      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Income */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-sm font-semibold text-foreground">Monthly Income</h4>
            </div>
            <InputField
              label="Gross Monthly Income (IDR)"
              type="number"
              value={(calcDraft ?? finProfile).monthlyIncome || ""}
              onChange={(e) => updateIncome(e.target.value)}
              placeholder="e.g. 15000000"
              icon={<DollarSign size={14} />}
            />
            {portfolioReturn !== null && (
              <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calculator size={13} />
                  <span>Actual portfolio return (weighted avg.)</span>
                </div>
                <span className="text-sm font-bold text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                  {portfolioReturn}% p.a.
                </span>
              </div>
            )}
          </div>

          {/* Expenses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <h4 className="text-sm font-semibold text-foreground">Monthly Expenses</h4>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries((calcDraft ?? finProfile).expenses).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">{EXPENSE_LABELS[key]}</label>
                  <input
                    type="number"
                    value={val || ""}
                    onChange={(e) => updateExpense(key, e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-2 rounded-md border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--input-background)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Allocation Summary */}
        <SurplusAllocation
          surplus={surplus}
          totalAllocated={totalAllocated}
          unallocated={unallocated}
          isAutoAlloc={isAutoAlloc}
          priorityGoal={priorityGoal}
          primaryPct={primaryPct}
          otherGoals={otherGoals}
          goals={goals}
          handleAutoAlloc={handleAutoAlloc}
        />
      </div>
    </div>
  );
}
