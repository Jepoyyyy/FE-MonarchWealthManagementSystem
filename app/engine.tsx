import type { AppUser, Asset, Product, Goal, FinancialProfile, HealthScore, Recommendation, ProductType, GoalAnalysis } from "~/types";
import { GOAL_MAX_MONTHS, GOAL_FAST_MONTHS, GOAL_PRODUCT_TYPES, GOAL_TYPE_CONFIG } from "~/config/goals";
import { monthsToGoal, monthlyNeeded, maxRiskForProfile, riskLabel, typeLabel, fmt, projectedDate, fmtDuration } from "~/utils";

export const analyzeGoal = (goal: Goal, effectiveCurrentSaved?: number): GoalAnalysis => {
  const saved = effectiveCurrentSaved ?? goal.currentSaved;

  const months = monthsToGoal(goal.targetAmount, saved, goal.monthlyContribution, goal.expectedReturn);

  if (saved >= goal.targetAmount) {
    return { status: "reached", months: 0, headline: "Goal reached!", detail: "You've fully funded this goal. Consider redirecting contributions elsewhere." };
  }
  if (months < 0) {
    return { status: "no_contribution", months: -1, headline: "No path to this goal", detail: "You have no monthly contribution set. Add one to start making progress." };
  }

  const maxM = GOAL_MAX_MONTHS[goal.type];
  const fastM = GOAL_FAST_MONTHS[goal.type];

  if (months > maxM) {
    const needed = monthlyNeeded(goal.targetAmount, saved, maxM, goal.expectedReturn);
    return {
      status: "too_little",
      months,
      headline: "You are saving too little",
      detail: `At ${fmt(goal.monthlyContribution)}/mo, this ${GOAL_TYPE_CONFIG[goal.type].label.toLowerCase()} goal takes ${fmtDuration(months)} — longer than the recommended ${fmtDuration(maxM)}. You need ${fmt(needed)}/mo to stay on track.`,
      suggestedMonthly: needed,
    };
  }

  if (months <= fastM) {
    return {
      status: "ahead",
      months,
      headline: `Almost there — ${fmtDuration(months)} to go`,
      detail: `Great pace! You're ahead of schedule and should reach this goal by ${projectedDate(months)}. Consider whether surplus can go toward another goal.`,
    };
  }

  return {
    status: "on_track",
    months,
    headline: `On track — ${fmtDuration(months)} remaining`,
    detail: `You'll reach this goal by ${projectedDate(months)} at your current contribution rate.`,
  };
};

export function calcHealthScore(
  user: AppUser, myAssets: Asset[], products: Product[],
  goals: Goal[], finProfile: FinancialProfile
): HealthScore {
  const productMap = new Map(products.map(p => [p.id, p]));
  const monthlyExpenses = Object.values(finProfile.expenses).reduce((a, b) => a + b, 0);
  const totalValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const maxRiskLv = maxRiskForProfile(user.riskProfile, false);

  // Emergency fund: target = 6× monthly expenses in liquid assets
  const emergencyTarget = monthlyExpenses * 6;
  const liquidValue = myAssets
    .filter(a => { const p = productMap.get(a.productId); return p && (p.type === "money_market" || p.type === "deposit"); })
    .reduce((s, a) => s + a.currentValue, 0);
  const emergency = emergencyTarget > 0 ? Math.min(25, Math.round((liquidValue / emergencyTarget) * 25)) : 12;

  // Diversification: unique product types owned vs eligible
  const eligibleTypes = new Set(products.filter(p => p.visible && p.riskLevel <= maxRiskLv).map(p => p.type));
  const ownedTypes = new Set(myAssets.map(a => productMap.get(a.productId)?.type).filter(Boolean) as ProductType[]);
  const diversification = eligibleTypes.size > 0 ? Math.min(25, Math.round((ownedTypes.size / eligibleTypes.size) * 25)) : 0;

  // Goal coverage: goals that have a matching product type in portfolio
  const goalCoverage = goals.length === 0 ? 12 : Math.round(
    (goals.filter(g => GOAL_PRODUCT_TYPES[g.type].some(t => ownedTypes.has(t))).length / goals.length) * 25
  );

  // Risk alignment: weighted avg portfolio risk vs profile target
  let riskAlignment = 12;
  if (totalValue > 0) {
    const avgRisk = myAssets.reduce((s, a) => {
      const p = productMap.get(a.productId);
      return s + (p ? (a.currentValue / totalValue) * p.riskLevel : 0);
    }, 0);
    const target = ({ risk_averse: 1.5, moderate: 2.5, risk_taker: 4 } as Record<string, number>)[user.riskProfile!] ?? 2.5;
    const diff = Math.abs(avgRisk - target);
    riskAlignment = diff <= 0.5 ? 25 : diff <= 1 ? 20 : diff <= 1.5 ? 14 : diff <= 2 ? 8 : 4;
  }

  return { total: emergency + diversification + goalCoverage + riskAlignment, emergency, diversification, goalCoverage, riskAlignment };
}

export function generateRecommendations(
  user: AppUser, myAssets: Asset[], products: Product[],
  goals: Goal[], finProfile: FinancialProfile
): Recommendation[] {
  const recs: Recommendation[] = [];
  const monthlyExpenses = Object.values(finProfile.expenses).reduce((a, b) => a + b, 0);
  const surplus = finProfile.monthlyIncome - monthlyExpenses;
  const totalValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const productMap = new Map(products.map(p => [p.id, p]));
  const maxRiskLv = maxRiskForProfile(user.riskProfile, false);
  const ownedIds = new Set(myAssets.map(a => a.productId));
  const ownedTypes = new Set(myAssets.map(a => productMap.get(a.productId)?.type).filter(Boolean) as ProductType[]);

  const bestOf = (types: ProductType[], maxRisk: number, exclude?: Set<string>) =>
    products
      .filter(p => p.visible && types.includes(p.type) && p.riskLevel <= maxRisk && !exclude?.has(p.id))
      .sort((a, b) => b.annualReturn - a.annualReturn)[0] ?? null;

  // 1. Emergency fund
  const emergencyTarget = monthlyExpenses * 6;
  const liquidValue = myAssets
    .filter(a => { const p = productMap.get(a.productId); return p && (p.type === "money_market" || p.type === "deposit"); })
    .reduce((s, a) => s + a.currentValue, 0);
  if (liquidValue < emergencyTarget * 0.8) {
    const p = bestOf(["money_market", "deposit"], 2);
    recs.push({
      id: "emergency", priority: "high", category: "emergency",
      title: "Build your emergency fund",
      reason: `You have ${fmt(liquidValue)} in liquid assets — only ${Math.round((liquidValue / emergencyTarget) * 100)}% of the recommended 6-month buffer (${fmt(emergencyTarget)}). Without this, a crisis could force you to liquidate long-term investments at a loss.`,
      product: p ?? undefined,
      suggestedAmount: p ? Math.max(emergencyTarget - liquidValue, p.minInvestment) : undefined,
    });
  }

  // 2. Concentration risk
  if (totalValue > 0 && myAssets.length > 0) {
    const byId = myAssets.reduce((acc, a) => { acc[a.productId] = (acc[a.productId] || 0) + a.currentValue; return acc; }, {} as Record<string, number>);
    const [topId, topVal] = Object.entries(byId).sort(([, a], [, b]) => b - a)[0];
    if (topVal / totalValue > 0.65) {
      const topProduct = productMap.get(topId);
      const complement = bestOf(
        (["money_market","deposit","bond","mutual_fund","stock"] as ProductType[]).filter(t => t !== topProduct?.type),
        maxRiskLv, ownedIds
      );
      recs.push({
        id: "concentration", priority: "high", category: "rebalance",
        title: `${topProduct?.name ?? "One position"} is ${Math.round(topVal / totalValue * 100)}% of your portfolio`,
        reason: `Heavy concentration in a single product amplifies loss if it underperforms. Adding a second product type reduces correlated risk without lowering your expected return significantly.`,
        product: complement ?? undefined,
        suggestedAmount: complement?.minInvestment,
      });
    }
  }

  // 3. Priority goal alignment
  const priorityGoal = goals.find(g => g.isPriority);
  if (priorityGoal) {
    const types = GOAL_PRODUCT_TYPES[priorityGoal.type];
    if (!types.some(t => ownedTypes.has(t))) {
      const p = bestOf(types, maxRiskLv + 1, ownedIds);
      if (p) {
        const months = monthsToGoal(priorityGoal.targetAmount, priorityGoal.currentSaved, priorityGoal.monthlyContribution, priorityGoal.expectedReturn);
        recs.push({
          id: `goal-priority`, priority: "high", category: "goal",
          title: `Start building toward "${priorityGoal.name}"`,
          reason: `Your priority goal needs ${fmt(priorityGoal.targetAmount)} by ${projectedDate(months)}. You don't yet hold any ${types.map(t => typeLabel(t)).join(" or ")} — the product categories best aligned with this goal type.`,
          product: p, goal: priorityGoal,
          suggestedAmount: Math.max(priorityGoal.monthlyContribution, p.minInvestment),
        });
      }
    }
  }

  // 4. Other goal alignment
  goals.filter(g => !g.isPriority).forEach(goal => {
    const types = GOAL_PRODUCT_TYPES[goal.type];
    if (!types.some(t => ownedTypes.has(t))) {
      const p = bestOf(types, maxRiskLv + 1, ownedIds);
      if (p && !recs.some(r => r.product?.id === p.id)) {
        const months = monthsToGoal(goal.targetAmount, goal.currentSaved, goal.monthlyContribution, goal.expectedReturn);
        recs.push({
          id: `goal-${goal.id}`, priority: "medium", category: "goal",
          title: `No product aligned with "${goal.name}"`,
          reason: `This goal works best with ${types.map(t => typeLabel(t)).join(" or ")}. ${p.name} (${p.annualReturn}% p.a.) fits the profile.`,
          product: p, goal,
          suggestedAmount: Math.max(goal.monthlyContribution, p.minInvestment),
        });
      }
    }
  });

  // 5. Diversification gaps — missing eligible product types
  (["money_market","deposit","bond","mutual_fund","stock"] as ProductType[])
    .filter(t => !ownedTypes.has(t))
    .forEach(t => {
      const p = bestOf([t], maxRiskLv);
      if (!p || recs.some(r => r.product?.id === p.id)) return;
      recs.push({
        id: `diversify-${t}`, priority: "medium", category: "diversification",
        title: `Add ${typeLabel(t)} exposure`,
        reason: `You hold no ${typeLabel(t)} products. ${p.name} returns ${p.annualReturn}% p.a. and fits within your ${riskLabel(user.riskProfile)} profile — adding it reduces single-category concentration.`,
        product: p, suggestedAmount: p.minInvestment,
      });
    });

  // 6. Highest-return opportunity not yet owned
  const topGrowth = products
    .filter(p => p.visible && !ownedIds.has(p.id) && p.riskLevel <= maxRiskLv && !recs.some(r => r.product?.id === p.id))
    .sort((a, b) => b.annualReturn - a.annualReturn)[0];
  if (topGrowth) {
    recs.push({
      id: "growth", priority: "low", category: "growth",
      title: `Best unowned opportunity: ${topGrowth.name}`,
      reason: `At ${topGrowth.annualReturn}% p.a., this is the highest-returning product within your ${riskLabel(user.riskProfile)} profile that you don't yet hold. Min. investment: ${fmt(topGrowth.minInvestment)}.`,
      product: topGrowth, suggestedAmount: topGrowth.minInvestment,
    });
  }

  // 7. Idle surplus
  if (surplus > 100000 && recs.length > 0) {
    const goalsTotal = goals.reduce((s, g) => s + g.monthlyContribution, 0);
    const undeployed = surplus - goalsTotal;
    if (undeployed > 100000) {
      recs.push({
        id: "surplus", priority: "low", category: "surplus",
        title: `${fmt(undeployed)}/mo is not yet allocated`,
        reason: `After expenses and goal contributions, you still have ${fmt(undeployed)} per month that could be working for you. Even at 5% p.a., that compounds to ${fmt(undeployed * 12 * 5)} over 5 years.`,
      });
    }
  }

  return recs.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - ({ high: 0, medium: 1, low: 2 }[b.priority])));
}
