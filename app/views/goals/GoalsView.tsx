import React, { useState } from "react";
import { Calculator, Plus, Wallet, TrendingDown, DollarSign, Target, TrendingUp, Check, Star } from "lucide-react";
import type { AppUser, Goal, FinancialProfile, Asset, Product, GoalType } from "~/types";
import { GOAL_TYPE_CONFIG } from "~/data";
import { fmt, riskLabel } from "~/utils";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { InputField } from "~/components/ui/InputField";
import { Btn } from "~/components/ui/Btn";
import { GoalCard } from "./GoalCard";
import { GoalFormModal } from "./GoalFormModal";

interface GoalsViewProps {
  user: AppUser;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  finProfile: FinancialProfile;
  setFinProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  assets: Asset[];
  products: Product[];
  toast: any;
}

export function GoalsView({
  user,
  goals,
  setGoals,
  finProfile,
  setFinProfile,
  assets,
  products,
  toast,
}: GoalsViewProps) {
  const [showCalc, setShowCalc] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [calcDraft, setCalcDraft] = useState<FinancialProfile | null>(null);

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

  const totalExpenses = Object.values(finProfile.expenses).reduce((a, b) => a + b, 0);
  const surplus = finProfile.monthlyIncome - totalExpenses;
  const totalAllocated = goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const unallocated = surplus - totalAllocated;

  const myAssets = assets.filter((a) => a.userId === user.id);
  const portfolioValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const portfolioReturn =
    portfolioValue > 0
      ? parseFloat(
          myAssets
            .reduce((s, a) => {
              const p = products.find((pr) => pr.id === a.productId);
              return s + (p ? (a.currentValue / portfolioValue) * p.annualReturn : 0);
            }, 0)
            .toFixed(2)
        )
      : null;

  const priorityGoal = goals.find((g) => g.isPriority);
  const otherGoals = goals.filter((g) => !g.isPriority);

  const isAutoAlloc = goals.length >= 2 && !!priorityGoal;
  const primaryPct =
    isAutoAlloc && surplus > 0 ? Math.round((priorityGoal!.monthlyContribution / surplus) * 100) : 50;

  React.useEffect(() => {
    const currentPriority = goals.find((g) => g.isPriority);
    const currentAutoAlloc = goals.length >= 2 && !!currentPriority;
    if (!currentAutoAlloc || surplus <= 0 || !currentPriority) return;

    const primaryAmt = currentPriority.monthlyContribution;
    const remaining = Math.max(0, surplus - primaryAmt);
    const currentOther = goals.filter((g) => !g.isPriority);
    const otherCount = currentOther.length;
    const eachOther = otherCount > 0 ? Math.floor(remaining / otherCount) : 0;

    const needsUpdate = currentOther.some((g) => g.monthlyContribution !== eachOther);
    if (needsUpdate) {
      setGoals((prev) =>
        prev.map((g) =>
          g.isPriority ? g : { ...g, monthlyContribution: eachOther }
        )
      );
    }
  }, [goals, surplus]);

  const handleAutoAlloc = (pct: number) => {
    if (!priorityGoal || surplus <= 0) return;
    const p = Math.min(Math.max(pct, 0), 100);
    const primaryAmt = Math.round((surplus * p) / 100);
    const remaining = Math.max(0, surplus - primaryAmt);
    const otherCount = goals.filter((g) => !g.isPriority).length;
    const eachOther = otherCount > 0 ? Math.floor(remaining / otherCount) : 0;

    setGoals((prev) =>
      prev.map((g) =>
        g.isPriority ? { ...g, monthlyContribution: primaryAmt } : { ...g, monthlyContribution: eachOther }
      )
    );
  };

  const addGoal = (data: Omit<Goal, "id">) => {
    const id = `g${Date.now()}`;
    const updated = data.isPriority ? goals.map((g) => ({ ...g, isPriority: false })) : goals;
    setGoals([...updated, { ...data, id }]);
    toast.success("Goal berhasil ditambahkan", {
      description: `"${data.name}" — target ${fmt(data.targetAmount)}`,
    });
    setShowAddGoal(false);
  };

  const saveEdit = (data: Omit<Goal, "id">) => {
    if (!editGoal) return;
    const finalData =
      isAutoAlloc && !editGoal.isPriority && surplus > 0
        ? {
            ...data,
            monthlyContribution: Math.floor(
              Math.max(0, surplus - Math.round((surplus * primaryPct) / 100)) / (otherGoals.length || 1)
            ),
          }
        : data;
    const updated = finalData.isPriority
      ? goals.map((g) => (g.id === editGoal.id ? { ...finalData, id: editGoal.id } : { ...g, isPriority: false }))
      : goals.map((g) => (g.id === editGoal.id ? { ...finalData, id: editGoal.id } : g));
    setGoals(updated);
    toast.success("Goal berhasil diperbarui", { description: `"${finalData.name}"` });
    setEditGoal(null);
  };

  const setPriority = (id: string) => {
    setGoals((prev) => prev.map((g) => ({ ...g, isPriority: g.id === id })));
    const g = goals.find((x) => x.id === id);
    toast.success("Priority goal diperbarui", { description: `"${g?.name}" sekarang menjadi prioritas` });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateIncome = (val: string) =>
    setCalcDraft((cur) => ({ ...(cur ?? finProfile), monthlyIncome: parseFloat(val) || 0 }));
  const updateExpense = (key: string, val: string) =>
    setCalcDraft((cur) => ({
      ...(cur ?? finProfile),
      expenses: { ...(cur ?? finProfile).expenses, [key]: parseFloat(val) || 0 },
    }));
  const handleSaveCalc = () => {
    if (calcDraft) setFinProfile(calcDraft);
    setCalcDraft(null);
    toast.success("Data kalkulator berhasil disimpan");
  };

  const avgFunded =
    goals.length > 0
      ? Math.round(
          goals.reduce((s, g) => s + Math.min((g.currentSaved / g.targetAmount) * 100, 100), 0) / goals.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Goals"
        action={
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" onClick={() => setShowCalc((s) => !s)}>
              <Calculator size={14} /> {showCalc ? "Hide" : "Show"} Calculator
            </Btn>
            <Btn size="sm" onClick={() => setShowAddGoal(true)}>
              <Plus size={14} /> Add Goal
            </Btn>
          </div>
        }
      />

      {/* Summary Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Monthly Income" value={fmt(finProfile.monthlyIncome)} icon={<Wallet size={16} />} />
        <StatCard label="Monthly Expenses" value={fmt(totalExpenses)} icon={<TrendingDown size={16} />} />
        <StatCard
          label="Investable Surplus"
          value={fmt(Math.max(surplus, 0))}
          sub={surplus < 0 ? "Deficit — review expenses" : `${fmt(unallocated)} unallocated`}
          icon={<DollarSign size={16} />}
          trend={surplus >= 0 ? (unallocated >= 0 ? "up" : "down") : "down"}
        />
        <StatCard label="Goals Progress" value={`${avgFunded}%`} sub="avg. funded" icon={<Target size={16} />} trend="up" />
        <StatCard
          label="Portfolio Return"
          value={portfolioReturn !== null ? `${portfolioReturn}%` : "—"}
          sub={portfolioReturn !== null ? "weighted avg. · live" : "No holdings yet"}
          icon={<TrendingUp size={16} />}
          trend={portfolioReturn !== null ? "up" : "neutral"}
        />
      </div>

      {/* Income & Expense Calculator */}
      {showCalc && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-border"
          >
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
                  <div
                    className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted border border-border"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calculator size={13} />
                      <span>Actual portfolio return (weighted avg.)</span>
                    </div>
                    <span
                      className="text-sm font-bold text-accent"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
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

            {/* Allocation summary */}
            <div className="mt-5 p-4 rounded-xl bg-muted">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Monthly Surplus Allocation
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Investable surplus</span>
                  <span
                    className="font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {fmt(Math.max(surplus, 0))}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden bg-border">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${surplus > 0 ? Math.min((totalAllocated / surplus) * 100, 100) : 0}%`,
                      background: unallocated < 0 ? "#ef4444" : "var(--primary)",
                    }}
                  />
                </div>

                {/* Auto-allocation */}
                {isAutoAlloc && surplus > 0 && (
                  <div
                    className="mt-2 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <Star size={11} className="text-amber-500" />
                        {priorityGoal!.name} — primary allocation
                      </label>
                      <span
                        className="text-xs font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: priorityGoal!.color }}
                      >
                        {primaryPct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={primaryPct}
                      onChange={(e) => handleAutoAlloc(parseInt(e.target.value))}
                      className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between text-foreground">
                        <span className="flex items-center gap-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: priorityGoal!.color }}
                          />{" "}
                          {priorityGoal!.name}
                        </span>
                        <span className="font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                          {fmt(priorityGoal!.monthlyContribution)}
                        </span>
                      </div>
                      {otherGoals.map((g) => (
                        <div key={g.id} className="flex justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: g.color }}
                            />{" "}
                            {g.name}
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)" }}>
                            {fmt(g.monthlyContribution)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border"
                    >
                      Other goals split the remaining{" "}
                      <span className="font-semibold">
                        {fmt(Math.max(0, surplus - priorityGoal!.monthlyContribution))}
                      </span>{" "}
                      equally (
                      {fmt(
                        Math.floor(
                          Math.max(0, surplus - priorityGoal!.monthlyContribution) /
                            (otherGoals.length || 1)
                        )
                      )}
                      /ea)
                    </p>
                  </div>
                )}

                {/* Manual allocation */}
                {!isAutoAlloc &&
                  goals.map((g) => (
                    <div key={g.id} className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: g.color }}
                        />
                        {g.name}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {fmt(g.monthlyContribution)}
                      </span>
                    </div>
                  ))}

                <div
                  className="flex justify-between text-xs font-semibold border-t border-border pt-2"
                >
                  <span style={{ color: unallocated < 0 ? "#ef4444" : "var(--foreground)" }}>
                    {goals.length === 0 ? "Not yet allocated" : "Unallocated"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: unallocated < 0 ? "#ef4444" : "#10b981",
                    }}
                  >
                    {unallocated >= 0 ? "+" : ""}
                    {fmt(unallocated)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No goals state */}
      {goals.length === 0 && (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 text-center">
          <Target size={40} className="text-muted-foreground mb-3" />
          <p className="font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
            No goals yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Set your first financial goal and let the calculator show you how to get there.
          </p>
          <Btn onClick={() => setShowAddGoal(true)}>
            <Plus size={14} /> Create First Goal
          </Btn>
        </div>
      )}

      {/* Priority Goal */}
      {priorityGoal && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={12} className="text-amber-500" /> Priority Goal
          </h3>
          <GoalCard
            goal={priorityGoal}
            surplus={surplus}
            assignedAssets={myAssets.filter((a) => a.goalId === priorityGoal.id)}
            products={products}
            onSetPriority={setPriority}
            onEdit={setEditGoal}
            onDelete={deleteGoal}
          />
        </div>
      )}

      {/* Other goals */}
      {otherGoals.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target size={12} /> {priorityGoal ? "Other Goals" : "Your Goals"}
          </h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {otherGoals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                surplus={surplus}
                assignedAssets={myAssets.filter((a) => a.goalId === g.id)}
                products={products}
                onSetPriority={setPriority}
                onEdit={setEditGoal}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form Modals */}
      {showAddGoal && (
        <GoalFormModal
          onSave={addGoal}
          onClose={() => setShowAddGoal(false)}
          surplus={surplus}
          monthlyIncome={finProfile.monthlyIncome}
          portfolioReturn={portfolioReturn}
          isAutoAlloc={isAutoAlloc}
        />
      )}
      {editGoal && (
        <GoalFormModal
          initial={editGoal}
          onSave={saveEdit}
          onClose={() => setEditGoal(null)}
          surplus={surplus}
          monthlyIncome={finProfile.monthlyIncome}
          portfolioReturn={portfolioReturn}
          isAutoAlloc={isAutoAlloc}
          autoMonthlyAmount={
            isAutoAlloc && !editGoal.isPriority && surplus > 0
              ? (() => {
                  const primaryAmt = Math.round((surplus * primaryPct) / 100);
                  const remaining = Math.max(0, surplus - primaryAmt);
                  return otherGoals.length > 0 ? Math.floor(remaining / otherGoals.length) : 0;
                })()
              : undefined
          }
        />
      )}
    </div>
  );
}
