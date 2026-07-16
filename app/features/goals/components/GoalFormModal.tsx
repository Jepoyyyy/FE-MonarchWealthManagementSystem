import { useState, useEffect } from "react";
import { X, DollarSign, Wallet, Lock, Calculator, AlertTriangle, ToggleLeft, ToggleRight, TrendingUp } from "lucide-react";
import type { Goal, GoalType, GoalStatus } from "~/types";
import { GOAL_TYPE_CONFIG } from '~/features/goals/goals.config';
import { monthsToGoal, fmt, fmtDuration, projectedDate } from "~/utils";
import { InputField } from '~/shared/components/Input';
import { MonthlyContributionInput } from "./MonthlyContributionInput";
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { Btn } from '~/shared/components/Button';

interface GoalFormModalProps {
  initial?: Goal;
  onSave: (g: Omit<Goal, "id">) => void;
  onClose: () => void;
  surplus: number;
  monthlyIncome: number;
  portfolioReturn: number | null;
  isAutoAlloc?: boolean;
  autoMonthlyAmount?: number;
}

export function GoalFormModal({
  initial,
  onSave,
  onClose,
  surplus,
  monthlyIncome,
  portfolioReturn,
  isAutoAlloc,
  autoMonthlyAmount,
}: GoalFormModalProps) {
  const [type, setType] = useState<GoalType>(initial?.type ?? "savings");
  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(initial ? String(initial.targetAmount) : "");
  const [saved, setSaved] = useState(initial ? String(initial.currentSaved) : "0");
  const [monthly, setMonthly] = useState(initial ? String(initial.monthlyContribution) : "");
  const [isPriority, setIsPriority] = useState(initial?.isPriority ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [err, setErr] = useState("");
  const [step, setStep] = useState(initial ? 1 : 0);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const dirty = !!(name || target || (saved && saved !== "0") || monthly || notes);
  const autoDisabled = isAutoAlloc && !isPriority;

  const selectType = (t: GoalType) => {
    setType(t);
    if (!name) setName(GOAL_TYPE_CONFIG[t].label);
    if (!target) setTarget(String(GOAL_TYPE_CONFIG[t].defaultTarget));
    setStep(1);
  };

  const save = () => {
    const t = parseFloat(target);
    const s = parseFloat(saved) || 0;
    const m = autoDisabled && autoMonthlyAmount != null ? autoMonthlyAmount : (parseFloat(monthly) || 0);
    if (!name.trim()) {
      setErr("Please enter a goal name.");
      return;
    }
    if (!t || t <= 0) {
      setErr("Target amount must be greater than 0.");
      return;
    }
    if (!autoDisabled && (!m || m <= 0)) {
      setErr("Monthly contribution must be greater than 0.");
      return;
    }
    onSave({
      name: name.trim(),
      type,
      targetAmount: t,
      currentSaved: s,
      monthlyContribution: m,
      expectedReturn: portfolioReturn ?? 7.5,
      isPriority,
      color: GOAL_TYPE_CONFIG[type].color,
      notes: notes.trim() || undefined,
    });
  };

  const cfg = GOAL_TYPE_CONFIG[type];
  const activeMonthly = autoDisabled && autoMonthlyAmount != null ? autoMonthlyAmount : (parseFloat(monthly) || 0);
  const previewMonths =
    name && parseFloat(target) && activeMonthly
      ? monthsToGoal(
          parseFloat(target),
          parseFloat(saved) || 0,
          activeMonthly,
          portfolioReturn ?? 7.5
        )
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,33,55,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-0">
          <h3
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {initial ? "Edit Goal" : step === 0 ? "Choose Goal Type" : "Configure Goal"}
          </h3>
          <Btn
            variant="unstyled"
            onClick={() => {
              if (dirty) setShowConfirmCancel(true);
              else onClose();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </Btn>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && !initial ? (
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(GOAL_TYPE_CONFIG) as GoalType[]).map((t) => {
                const c = GOAL_TYPE_CONFIG[t];
                return (
                  <Btn
                    variant="unstyled"
                    key={t}
                    onClick={() => selectType(t)}
                    className="p-4 rounded-xl border-2 text-left hover:shadow-sm transition-all border-border bg-muted hover:border-primary/50"
                  >
                    <span className="text-2xl block mb-2">{c.icon}</span>
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </Btn>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {!initial && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}
                >
                  <span className="text-2xl">{cfg.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: cfg.color }}>
                      {cfg.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{cfg.description}</p>
                  </div>
                  <Btn
                    variant="unstyled"
                    onClick={() => setStep(0)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Change
                  </Btn>
                </div>
              )}

              <InputField
                label="Goal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${cfg.label}`}
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Target Amount (IDR)"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 500000000"
                  icon={<DollarSign size={14} />}
                />
                <InputField
                  label="Already Saved (IDR)"
                  type="number"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                  placeholder="0"
                  icon={<Wallet size={14} />}
                />
              </div>

              {/* Monthly Contribution */}
              {isPriority && (
                <MonthlyContributionInput
                  monthly={monthly}
                  setMonthly={setMonthly}
                  surplus={surplus}
                  monthlyIncome={monthlyIncome}
                />
              )}

              {/* Priority toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium text-foreground">Set as Priority Goal</p>
                  <p className="text-xs text-muted-foreground">Highlight this goal above others</p>
                </div>
                <Btn variant="unstyled" type="button" onClick={() => setIsPriority((s) => !s)}>
                  {isPriority ? (
                    <ToggleRight size={28} style={{ color: "var(--accent)" }} />
                  ) : (
                    <ToggleLeft size={28} className="text-muted-foreground" />
                  )}
                </Btn>
              </div>

              <InputField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Based on 25× annual expense rule"
              />

              {previewMonths !== null && (
                <div
                  className="p-4 rounded-xl border"
                  style={{ background: `${cfg.color}0d`, borderColor: `${cfg.color}30` }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Projection preview</p>
                  <p className="text-sm font-semibold text-foreground">
                    Reach goal in <span style={{ color: cfg.color }}>{fmtDuration(previewMonths)}</span>
                    {previewMonths > 0 && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · est. {projectedDate(previewMonths)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {err && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {err}
                </p>
              )}
            </div>
          )}
        </div>

        {(step === 1 || initial) && (
          <div className="flex gap-3 p-6 pt-0">
            <Btn
              variant="secondary"
              className="flex-1"
              onClick={() => {
                if (dirty) setShowConfirmCancel(true);
                else onClose();
              }}
            >
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={save}>
              {initial ? "Save Changes" : "Create Goal"}
            </Btn>
          </div>
        )}

        {showConfirmCancel && (
          <ConfirmModal
            open={showConfirmCancel}
            onOpenChange={setShowConfirmCancel}
            title="Batalkan perubahan?"
            message={dirty ? "Perubahan yang belum disimpan akan hilang." : "Tutup form ini?"}
            confirmLabel="Ya, batalkan"
            onConfirm={onClose}
          />
        )}
      </div>
    </div>
  );
}
