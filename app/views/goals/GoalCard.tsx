import { useState } from "react";
import {
  CheckCircle,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  XCircle,
  Star,
  Edit3,
  Trash2,
  Briefcase,
  Info,
} from "lucide-react";
import type { Goal, Asset, Product, GoalStatus } from "~/types";
import { GOAL_TYPE_CONFIG } from "~/config/goals";
import { Btn } from '~/shared/components/Button';
import { analyzeGoal } from "~/engine";
import { fmt, fmtDuration, projectedDate } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { ConfirmModal } from '~/shared/components/ConfirmModal';

interface GoalCardProps {
  goal: Goal;
  surplus: number;
  assignedAssets: Asset[];
  products: Product[];
  onSetPriority: (id: string) => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({
  goal,
  surplus,
  assignedAssets,
  products,
  onSetPriority,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const cfg = GOAL_TYPE_CONFIG[goal.type];
  const hasAssets = assignedAssets.length > 0;

  // If assets are assigned, current value and cost come from them
  const assetCurrentValue = assignedAssets.reduce((s, a) => s + a.currentValue, 0);
  const assetCostBasis = assignedAssets.reduce((s, a) => s + a.amount, 0);
  const effectiveSaved = hasAssets ? assetCurrentValue : goal.currentSaved;
  const assetGain = assetCurrentValue - assetCostBasis;
  const assetRetPct = assetCostBasis > 0 ? (assetGain / assetCostBasis) * 100 : 0;

  const analysis = analyzeGoal(goal, effectiveSaved);
  const progress = Math.min((effectiveSaved / goal.targetAmount) * 100, 100);
  const overAllocated = goal.monthlyContribution > surplus;

  const statusStyle: Record<GoalStatus, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    reached: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)", text: "#059669", icon: <CheckCircle size={13} /> },
    ahead: { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", text: "#10b981", icon: <ArrowUpRight size={13} /> },
    on_track: { bg: "rgba(26,58,92,0.06)", border: "rgba(26,58,92,0.15)", text: "var(--primary)", icon: <Clock size={13} /> },
    too_little: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "#d97706", icon: <AlertTriangle size={13} /> },
    no_contribution: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#dc2626", icon: <XCircle size={13} /> },
  };
  const ss = statusStyle[analysis.status];

  return (
    <div
      className={`bg-card rounded-xl border-2 transition-all ${
        goal.isPriority ? "shadow-lg" : "border-border hover:border-primary/20"
      }`}
      style={goal.isPriority ? { borderColor: goal.color } : {}}
    >
      {goal.isPriority && (
        <div
          className="px-5 py-2 rounded-t-xl flex items-center gap-2 text-xs font-semibold"
          style={{ background: goal.color, color: "white" }}
        >
          <Star size={12} /> Priority Goal
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${goal.color}18` }}
            >
              {cfg.icon}
            </div>
            <div>
              <p
                className="font-semibold text-sm leading-tight text-foreground"
              >
                {goal.name}
              </p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!goal.isPriority && (
              <Btn
                variant="unstyled"
                onClick={() => onSetPriority(goal.id)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors"
                title="Set as priority"
              >
                <Star size={14} />
              </Btn>
            )}
            <Btn
              variant="unstyled"
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <Edit3 size={14} />
            </Btn>
            <Btn
              variant="unstyled"
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </Btn>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              {hasAssets ? "Portfolio value" : "Saved"}
            </span>
            <span
              className="text-xs font-medium text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {fmt(effectiveSaved)}{" "}
              <span className="text-muted-foreground font-normal">/ {fmt(goal.targetAmount)}</span>
            </span>
          </div>
          <div className="w-full rounded-full h-2 bg-muted">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progress}%`, background: goal.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-medium" style={{ color: goal.color }}>
              {progress.toFixed(0)}% funded
            </span>
          </div>
        </div>

        {/* Assigned assets */}
        {hasAssets ? (
          <div className="mb-3 rounded-lg overflow-hidden border border-border">
            <div
              className="px-3 py-2 flex items-center justify-between bg-muted border-b border-border"
            >
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Briefcase size={11} /> {assignedAssets.length} assigned position
                {assignedAssets.length !== 1 ? "s" : ""}
              </span>
              <span
                className={`text-xs font-semibold ${
                  assetGain >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {assetGain >= 0 ? "+" : ""}
                {fmt(assetGain)}
              </span>
            </div>
            {assignedAssets.map((a) => {
              const p = products.find((pr) => pr.id === a.productId);
              const ret = ((a.currentValue - a.amount) / a.amount) * 100;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ProductTypeBadge type={p?.type ?? "deposit"} />
                    <span className="text-xs truncate text-foreground">
                      {p?.name ?? "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span
                      className={`text-xs ${ret >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {ret >= 0 ? "+" : ""}
                      {ret.toFixed(1)}%
                    </span>
                    <span
                      className="text-xs font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmt(a.currentValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="mb-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground bg-muted border border-dashed border-border"
          >
            <Briefcase size={12} />
            <span>
              No assets assigned — link positions in <strong>My Assets</strong> to track real growth
              here.
            </span>
          </div>
        )}

        {/* Analysis banner */}
        <div
          className="rounded-lg px-3 py-2.5 mb-3 flex items-start gap-2 border"
          style={{ background: ss.bg, borderColor: ss.border }}
        >
          <span className="mt-0.5 shrink-0" style={{ color: ss.text }}>
            {ss.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: ss.text }}>
              {analysis.headline}
            </p>
            <p
              className="text-xs mt-0.5 leading-relaxed"
              style={{ color: ss.text, opacity: 0.85 }}
            >
              {analysis.detail}
            </p>
            {analysis.status === "too_little" && analysis.suggestedMonthly && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Suggested:</span>
                <span
                  className="text-xs font-bold"
                  style={{ fontFamily: "var(--font-mono)", color: ss.text }}
                >
                  {fmt(analysis.suggestedMonthly)}/mo
                </span>
                <span className="text-xs text-muted-foreground">
                  (+{fmt(analysis.suggestedMonthly - goal.monthlyContribution)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg p-2.5 text-center bg-muted">
            <p
              className="text-sm font-bold text-foreground"
              style={{
                fontFamily: "var(--font-mono)",
                color: analysis.status === "too_little" ? "#d97706" : "var(--foreground)",
              }}
            >
              {fmtDuration(analysis.months)}
            </p>
            <p className="text-xs text-muted-foreground">to goal</p>
          </div>
          <div className="rounded-lg p-2.5 text-center bg-muted">
            <p
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {projectedDate(analysis.months)}
            </p>
            <p className="text-xs text-muted-foreground">est. date</p>
          </div>
        </div>

        {/* Monthly contribution */}
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            overAllocated ? "bg-red-50 border border-red-200" : "bg-muted"
          }`}
        >
          <span className="text-xs text-muted-foreground">Monthly contribution</span>
          <span
            className={`text-xs font-semibold ${overAllocated ? "text-red-600" : "text-foreground"}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fmt(goal.monthlyContribution)}/mo{overAllocated && " ⚠️"}
          </span>
        </div>

        {goal.notes && (
          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
            <Info size={11} className="mt-0.5 shrink-0" />
            {goal.notes}
          </p>
        )}
      </div>

      {showConfirmDelete && (
        <ConfirmModal
          open={showConfirmDelete}
          onOpenChange={setShowConfirmDelete}
          title="Hapus goal ini?"
          message={`"${goal.name}" akan dihapus permanen.`}
          confirmLabel="Ya, hapus"
          onConfirm={() => onDelete(goal.id)}
        />
      )}
    </div>
  );
}
