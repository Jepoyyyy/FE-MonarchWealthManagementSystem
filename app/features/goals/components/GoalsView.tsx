import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Wallet, TrendingDown, DollarSign, Target, TrendingUp, Calculator, Star } from "lucide-react";
import type { AppUser, Goal, FinancialProfile, Asset, Product } from "~/types";
import { fmt } from "~/utils";
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Btn } from '~/shared/components/Button';
import { GoalCard } from "./GoalCard";
import { GoalFormModal } from "./GoalFormModal";
import { WealthCalculator } from "./WealthCalculator";
import { useGoalsStore } from '~/features/goals/goals.store';
import { GoalApi } from '~/features/goals/api';

interface GoalsViewProps {
  user: AppUser;
  finProfile: FinancialProfile;
  setFinProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  assets: Asset[];
  products: Product[];
  toast: any;
}

export function GoalsView({
  user,
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

  const { goals, loading, fetchGoals } = useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totalExpenses = useMemo(
    () => Object.values(finProfile.expenses).reduce((a, b) => a + b, 0),
    [finProfile.expenses]
  );
  const surplus = useMemo(() => finProfile.monthlyIncome - totalExpenses, [finProfile.monthlyIncome, totalExpenses]);
  const totalAllocated = useMemo(() => goals.reduce((s, g) => s + g.monthlyContribution, 0), [goals]);
  const unallocated = useMemo(() => surplus - totalAllocated, [surplus, totalAllocated]);

  const myAssets = useMemo(() => assets.filter((a) => a.userId === user.id), [assets, user.id]);
  const portfolioValue = useMemo(() => myAssets.reduce((s, a) => s + a.currentValue, 0), [myAssets]);
  const portfolioReturn = useMemo(
    () =>
      portfolioValue > 0
        ? parseFloat(
            myAssets
              .reduce((s, a) => {
                const p = products.find((pr) => pr.id === a.productId);
                return s + (p ? (a.currentValue / portfolioValue) * p.annualReturn : 0);
              }, 0)
              .toFixed(2)
          )
        : null,
    [myAssets, portfolioValue, products]
  );

  const priorityGoal = useMemo(() => goals.find((g) => g.isPriority), [goals]);
  const otherGoals = useMemo(() => goals.filter((g) => !g.isPriority), [goals]);

  const isAutoAlloc = useMemo(() => goals.length >= 2 && !!priorityGoal, [goals.length, priorityGoal]);
  const primaryPct = useMemo(
    () => (isAutoAlloc && surplus > 0 ? Math.round((priorityGoal!.monthlyContribution / surplus) * 100) : 50),
    [isAutoAlloc, surplus, priorityGoal]
  );

  const handleAutoAlloc = (pct: number) => {
    if (!priorityGoal || surplus <= 0) return;
    const p = Math.min(Math.max(pct, 0), 100);
    const primaryAmt = Math.round((surplus * p) / 100);
    const remaining = Math.max(0, surplus - primaryAmt);
    const otherCount = goals.filter((g) => !g.isPriority).length;
    const eachOther = otherCount > 0 ? Math.floor(remaining / otherCount) : 0;

    // Local state updating is removed since backend handles it, but for UI responsiveness we might want to re-fetch
    goals.forEach(async (g) => {
       const amt = g.isPriority ? primaryAmt : eachOther;
       if (g.monthlyContribution !== amt) {
          await GoalApi.update(g.id, { ...g, monthlyContribution: amt } as any);
       }
    });
    fetchGoals();
  };

  const addGoal = async (data: Omit<Goal, "id">) => {
    try {
      await GoalApi.create(data as any);
      toast.success("Goal berhasil ditambahkan", {
        description: `"${data.name}" — target ${fmt(data.targetAmount)}`,
      });
      setShowAddGoal(false);
      fetchGoals();
    } catch (err: any) {
      toast.error("Gagal menambah goal", { description: err.message });
      throw err;
    }
  };

  const saveEdit = async (data: Omit<Goal, "id">) => {
    if (!editGoal) return;
    try {
      const finalData =
        isAutoAlloc && !editGoal.isPriority && surplus > 0
          ? {
              ...data,
              monthlyContribution: Math.floor(
                Math.max(0, surplus - Math.round((surplus * primaryPct) / 100)) / (otherGoals.length || 1)
              ),
            }
          : data;

      await GoalApi.update(editGoal.id, finalData as any);
      toast.success("Goal berhasil diperbarui", { description: `"${finalData.name}"` });
      setEditGoal(null);
      fetchGoals();
    } catch (err: any) {
      toast.error("Gagal memperbarui goal", { description: err.message });
      throw err;
    }
  };

  const setPriority = async (id: string) => {
    try {
      const g = goals.find((x) => x.id === id);
      if (g) {
         await GoalApi.update(g.id, { ...g, isPriority: true } as any);
         toast.success("Priority goal diperbarui", { description: `"${g.name}" sekarang menjadi prioritas` });
         fetchGoals();
      }
    } catch (err: any) {
      toast.error("Gagal mengubah prioritas", { description: err.message });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await GoalApi.delete(id);
      fetchGoals();
      toast.success("Goal berhasil dihapus");
    } catch (err: any) {
      toast.error("Gagal menghapus goal", { description: err.message });
    }
  };

  const updateIncome = useCallback(
    (val: string) => setCalcDraft((cur) => ({ ...(cur ?? finProfile), monthlyIncome: parseFloat(val) || 0 })),
    [finProfile]
  );
  const updateExpense = useCallback(
    (key: string, val: string) =>
      setCalcDraft((cur) => ({
        ...(cur ?? finProfile),
        expenses: { ...(cur ?? finProfile).expenses, [key]: parseFloat(val) || 0 },
      })),
    [finProfile]
  );
  const handleSaveCalc = useCallback(() => {
    if (calcDraft) setFinProfile(calcDraft);
    setCalcDraft(null);
    toast.success("Data kalkulator berhasil disimpan");
  }, [calcDraft, setFinProfile, toast]);

  const avgFunded = useMemo(
    () =>
      goals.length > 0
        ? Math.round(
            goals.reduce((s, g) => s + Math.min((g.currentSaved / g.targetAmount) * 100, 100), 0) / goals.length
          )
        : 0,
    [goals]
  );

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
        <WealthCalculator
          surplus={surplus}
          totalExpenses={totalExpenses}
          portfolioReturn={portfolioReturn}
          finProfile={finProfile}
          calcDraft={calcDraft}
          updateIncome={updateIncome}
          updateExpense={updateExpense}
          handleSaveCalc={handleSaveCalc}
          totalAllocated={totalAllocated}
          unallocated={unallocated}
          isAutoAlloc={isAutoAlloc}
          priorityGoal={priorityGoal}
          primaryPct={primaryPct}
          otherGoals={otherGoals}
          goals={goals}
          handleAutoAlloc={handleAutoAlloc}
        />
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
