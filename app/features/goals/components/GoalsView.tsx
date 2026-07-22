import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit3 } from "lucide-react";
import type { AppUser, Goal, FinancialProfile, Asset, Product } from "~/types";
import { PageHeader } from "~/shared/components/PageHeader";
import { Btn } from "~/shared/components/Button";
import { FinancialProfileModal } from "~/features/finances";
import { useGoalsStore } from "~/features/goals/goals.store";
import { usePortfolioStore } from "~/features/assets/portfolio.store";
import { GoalApi } from "~/features/goals/api";

// Calculations
import { calculateAverageFunded } from "~/features/goals/goals.calculations";

// Custom hooks
import { usePortfolio } from "~/features/goals/hooks/usePortfolio";
import { useFinancialSummary } from "~/features/goals/hooks/useFinancialSummary";
import { useAutoAllocation } from "~/features/goals/hooks/useAutoAllocation";
import { useGoalOperations } from "~/features/goals/hooks/useGoalOperations";

// UI components
import { GoalsSummaryStats } from "~/features/goals/components/GoalsSummaryStats";
import { EmptyGoalsState } from "~/features/goals/components/EmptyGoalsState";
import { PriorityGoalSection } from "~/features/goals/components/PriorityGoalSection";
import { OtherGoalsGrid } from "~/features/goals/components/OtherGoalsGrid";
import { GoalFormModal } from "~/features/goals/components/GoalFormModal";

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
  // UI state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [showFinProfileModal, setShowFinProfileModal] = useState(false);

  // Data layer
  const { goals, fetchGoals, fetchProjections } = useGoalsStore();
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const portfolioLoading = usePortfolioStore((s) => s.loading);
  const isLoading = portfolioLoading;

  // Custom hooks - business logic extraction
  const portfolio = usePortfolio(assets, products, user.id);
  const summary = useFinancialSummary(finProfile, goals);

  const autoAlloc = useAutoAllocation(
    goals,
    summary.surplus,
    fetchGoals,
    (msg) => toast.error("Gagal mengalokasi surplus", { description: msg })
  );

  const operations = useGoalOperations(
    fetchGoals,
    (msg, desc) => toast.success(msg, { description: desc }),
    (msg, desc) => toast.error(msg, { description: desc })
  );

  // Initial data fetch
  useEffect(() => {
    useGoalsStore.getState().fetchGoals();
    usePortfolioStore.getState().fetchPortfolio();
  }, []);

  // Calculated metrics
  const avgFunded = calculateAverageFunded(goals, portfolio.assets);

  // Financial profile save handler
  const handleSaveFinProfile = useCallback(
    (data: any) => {
      setFinProfile({
        monthlyIncome: data.monthlyIncome,
        expenses: {
          housing: data.housing,
          food: data.food,
          transport: data.transport,
          utilities: data.utilities,
          healthcare: data.healthcare,
          entertainment: data.entertainment,
          insurance: data.insurance,
          other: data.other,
        },
      });
      fetchGoals();
      fetchProjections();
      toast.success("Financial profile updated successfully");
    },
    [setFinProfile, fetchGoals, fetchProjections, toast]
  );

  // Goal form handlers
  const handleAddGoal = async (data: Omit<Goal, "id">) => {
    await operations.addGoal(data);
    setShowAddGoal(false);

    // Trigger auto-allocation if applicable (predict next state to avoid render lag)
    const nextIsAutoAlloc = (goals.length + 1) >= 2 && !!autoAlloc.priorityGoal;
    if (nextIsAutoAlloc && !data.isPriority && summary.surplus > 0 && autoAlloc.priorityGoal) {
      const nextPrimaryPct = Math.round((autoAlloc.priorityGoal.monthlyContribution / summary.surplus) * 100);
      await GoalApi.autoAllocate(nextPrimaryPct);
      await fetchGoals();
    }
  };

  const handleEditGoal = async (data: Omit<Goal, "id">) => {
    if (!editGoal) return;

    // Apply auto-allocation calculation if needed
    const finalData =
      autoAlloc.isActive && !editGoal.isPriority && summary.surplus > 0
        ? {
            ...data,
            monthlyContribution: autoAlloc.calculateOtherGoalAmount(autoAlloc.otherGoals.length),
          }
        : data;

    await operations.updateGoal(editGoal.id, finalData);
    setEditGoal(null);
  };

  const handleSetPriority = async (id: string) => {
    await operations.setPriority(id, goals);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Financial Goals"
        action={
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" onClick={() => setShowFinProfileModal(true)}>
              <Edit3 size={14} /> Edit Profile
            </Btn>
            <Btn size="sm" onClick={() => setShowAddGoal(true)}>
              <Plus size={14} /> Add Goal
            </Btn>
          </div>
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Summary Stats */}
          <GoalsSummaryStats
            finProfile={finProfile}
            totalExpenses={summary.totalExpenses}
            surplus={summary.surplus}
            unallocated={summary.unallocated}
            avgFunded={avgFunded}
            portfolioReturn={portfolio.weightedReturn}
          />

          {/* Empty State */}
          {goals.length === 0 && <EmptyGoalsState onCreateGoal={() => setShowAddGoal(true)} />}

          {/* Priority Goal */}
          {autoAlloc.priorityGoal && (
            <PriorityGoalSection
              goal={autoAlloc.priorityGoal}
              surplus={summary.surplus}
              assignedAssets={portfolio.assets.filter((a) => a.goalId === autoAlloc.priorityGoal!.id)}
              products={products}
              onSetPriority={handleSetPriority}
              onEdit={setEditGoal}
              onDelete={operations.deleteGoal}
            />
          )}

          {/* Other Goals Grid */}
          <OtherGoalsGrid
            goals={autoAlloc.otherGoals}
            hasPriorityGoal={!!autoAlloc.priorityGoal}
            surplus={summary.surplus}
            userAssets={portfolio.assets}
            products={products}
            onSetPriority={handleSetPriority}
            onEdit={setEditGoal}
            onDelete={operations.deleteGoal}
          />
        </>
      )}

      {/* Modals */}
      {showAddGoal && (
        <GoalFormModal
          onSave={handleAddGoal}
          onClose={() => setShowAddGoal(false)}
          surplus={summary.surplus}
          monthlyIncome={finProfile.monthlyIncome}
          portfolioReturn={portfolio.weightedReturn}
          isAutoAlloc={autoAlloc.isActive}
          autoMonthlyAmount={
            autoAlloc.isActive && summary.surplus > 0
              ? autoAlloc.calculateOtherGoalAmount(autoAlloc.otherGoals.length + 1)
              : undefined
          }
        />
      )}

      {editGoal && (
        <GoalFormModal
          initial={editGoal}
          onSave={handleEditGoal}
          onClose={() => setEditGoal(null)}
          surplus={summary.surplus}
          monthlyIncome={finProfile.monthlyIncome}
          portfolioReturn={portfolio.weightedReturn}
          isAutoAlloc={autoAlloc.isActive}
          autoMonthlyAmount={
            autoAlloc.isActive && !editGoal.isPriority && summary.surplus > 0
              ? autoAlloc.calculateOtherGoalAmount(autoAlloc.otherGoals.length)
              : undefined
          }
        />
      )}

      <FinancialProfileModal
        open={showFinProfileModal}
        onClose={() => setShowFinProfileModal(false)}
        onSave={handleSaveFinProfile}
        initialData={{
          monthlyIncome: finProfile.monthlyIncome,
          housing: finProfile.expenses.housing || 0,
          food: finProfile.expenses.food || 0,
          transport: finProfile.expenses.transport || 0,
          utilities: finProfile.expenses.utilities || 0,
          healthcare: finProfile.expenses.healthcare || 0,
          entertainment: finProfile.expenses.entertainment || 0,
          insurance: finProfile.expenses.insurance || 0,
          other: finProfile.expenses.other || 0,
        }}
      />
    </div>
  );
}
