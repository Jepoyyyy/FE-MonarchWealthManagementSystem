import { useState } from "react";
import { ChevronRight, Trash2, Info, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import type { Asset, Product, Goal } from "~/types";
import { GOAL_TYPE_CONFIG } from '~/features/goals/goals.config';
import { fmt, fmtPct } from "~/utils";
import { ProductTypeBadge } from '~/features/products/components/ProductTypeBadge';
import { RiskLevelBadge } from '~/features/profile/components/RiskLevelBadge';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionHistoryTable } from "./TransactionHistoryTable";
import { Btn } from '~/shared/components/Button';
import { useAssetDetail } from '~/features/assets/hooks/useAssetDetail';

interface AssetDetailPageProps {
  asset: Asset;
  product: Product;
  goals: Goal[];
  onSave: (id: string, data: Partial<Asset>, txType?: "buy" | "sell", txQty?: number, txPrice?: number, txMethod?: "amount" | "units") => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function AssetDetailPage({
  asset,
  product,
  goals,
  onSave,
  onDelete,
  onBack,
}: AssetDetailPageProps) {
  const {
    goalId,
    setGoalId,
    showConfirmDelete,
    setShowConfirmDelete,
    showConfirmCancel,
    setShowConfirmCancel,
    showTxModal,
    setShowTxModal,
    isDeposit,
    isBond,
    isStock,
    isMF,
    qtyLabel,
    lotNum,
    curValNum,
    avgVal,
    currentAssetValue,
    pnlAmt,
    pnlPct,
    hasChanges,
    handleSave,
  } = useAssetDetail({ asset, product, onSave, onBack });

  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const selectedGoal = goals.find((g) => g.id === goalId);  return (
    <div className="space-y-6">
      <Btn
        variant="unstyled"
        onClick={() => {
          if (hasChanges) setShowConfirmCancel(true);
          else onBack();
        }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronRight size={16} className="rotate-180" /> Back to My Assets
      </Btn>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ProductTypeBadge type={product.type} />
          <div>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {product.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {product.issuer} · <RiskLevelBadge level={product.riskLevel} className="align-middle" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            variant="unstyled"
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
            title="Remove asset"
            aria-label="Remove asset"
          >
            <Trash2 size={16} />
          </Btn>
        </div>
      </div>

      {/* Transaction Actions */}
      <div className="flex gap-3 mb-6">
        <Btn
          className="flex-1"
          onClick={() => setShowTxModal("buy")}
        >
          Buy / Top Up
        </Btn>
        <Btn
          variant="secondary"
          className="flex-1 bg-red-50! text-red-600! hover:bg-red-100! border-red-200"
          onClick={() => setShowTxModal("sell")}
        >
          Sell / Redeem
        </Btn>
      </div>

      {showTxModal && (
        <AddTransactionModal
          asset={asset}
          product={product}
          type={showTxModal}
          onClose={() => setShowTxModal(null)}
          onSaveTransaction={(txData) => {
            onSave(asset.id, { amount: txData.amount }, showTxModal, txData.quantity, txData.currentValue, txData.method);
            setShowTxModal(null);
          }}
        />
      )}

      <div className="bg-card rounded-xl border border-border p-5 relative">
        <label htmlFor="goal-select" className="text-sm font-medium block mb-1.5 text-foreground">Link to Goal</label>
        <button
          id="goal-select"
          type="button"
          role="combobox"
          aria-label="Link to Goal"
          aria-expanded={isGoalOpen}
          aria-controls="goal-options"
          onClick={() => setIsGoalOpen(!isGoalOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground border-border"
        >
          <span>
            {selectedGoal ? `${GOAL_TYPE_CONFIG[selectedGoal.type]?.icon || "🎯"} ${selectedGoal.name}` : "No goal linked"}
          </span>
          <ChevronRight size={16} className={`transition-transform ${isGoalOpen ? "rotate-90" : ""}`} />
        </button>

        {isGoalOpen && (
          <div
            id="goal-options"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1 z-20 bg-card border border-border rounded-md shadow-lg py-1 max-h-48 overflow-y-auto"
          >
            {goals.map((g) => (
              <div
                key={g.id}
                role="option"
                aria-selected={goalId === g.id}
                onClick={() => {
                  setGoalId(g.id);
                  setIsGoalOpen(false);
                }}
                className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2"
              >
                <span>{GOAL_TYPE_CONFIG[g.type]?.icon || "🎯"}</span>
                <span>{g.name}</span>
              </div>
            ))}
            <div
              role="option"
              aria-selected={!goalId}
              onClick={() => {
                setGoalId("");
                setIsGoalOpen(false);
              }}
              className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2"
            >
              No goal linked
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
          <p
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fmt(asset.amount)}
          </p>
        </div>

        {!isDeposit && (
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">{qtyLabel}</p>
            <p
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {isStock ? `${lotNum} Lot` : isMF ? `${lotNum.toFixed(4)} Units` : isBond ? fmt(lotNum) : lotNum}
            </p>
          </div>
        )}

        {!isDeposit && (
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">Average Value</p>
            <p
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {isBond ? `${(avgVal * 100).toFixed(2)}%` : fmt(Math.round(avgVal))}
            </p>
            <p className="text-xs text-muted-foreground">
              {isBond ? "avg. purchase price" : "per unit"}
            </p>
          </div>
        )}

        {!isDeposit && (
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">Current Value (from market data)</p>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-mono)",
                color: product.currentPrice >= (isBond ? avgVal * 100 : avgVal) ? "var(--foreground)" : "#ef4444",
              }}
            >
              {isStock || isMF ? fmt(product.currentPrice) : `${product.currentPrice.toFixed(2)}%`}
            </p>
            <p className="text-xs text-muted-foreground">
              {isStock ? "per share" : isMF ? "per unit / NAV" : isBond ? "of face value" : ""}
            </p>
          </div>
        )}

        <div
          className="bg-card rounded-xl border border-border p-5"
          style={isDeposit ? { gridColumn: "span 2" } : {}}
        >
          <p className="text-xs text-muted-foreground mb-1">Current Assets Value</p>
          <p
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fmt(currentAssetValue)}
          </p>
          <p className="text-xs text-muted-foreground">
            {isDeposit ? "Deposito pokok (bunga belum dihitung)" : "current valuation"}
          </p>
        </div>
      </div>

      {isDeposit ? (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Info size={14} />
            <span>Interest Rate: {product.annualReturn}% p.a. (Fixed)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Interest Payment Type</span>
            <span className="font-semibold text-foreground">Monthly Accumulation</span>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Profit / Loss Unrealized</span>
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                  pnlAmt >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                }`}
              >
                {pnlAmt >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {pnlAmt >= 0 ? "+" : ""}
                {fmtPct(pnlPct)}
              </span>
            </div>
          </div>
          <div className="p-5 flex justify-between items-center bg-muted/30">
            <span className="text-xs text-muted-foreground">Est. Value Change</span>
            <span
              className={`text-base font-bold ${pnlAmt >= 0 ? "text-emerald-600" : "text-red-500"}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {pnlAmt >= 0 ? "+" : ""}
              {fmt(pnlAmt)}
            </span>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <TransactionHistoryTable assetId={asset.id} />

      {/* Action buttons */}
      {!showTxModal && (
        <div className="flex gap-3">
          <Btn variant="secondary" className="flex-1" onClick={() => setShowConfirmCancel(true)}>
            Cancel
          </Btn>
          <Btn className="flex-1" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Btn>
        </div>
      )}

      {/* Confirmation and Deletion Modals */}
      <ConfirmModal
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Confirm Delete"
        message="This asset and it's related history will be removed"
        confirmLabel="Yes"
        onConfirm={() => {
          onDelete(asset.id);
          onBack();
        }}
      />

      <ConfirmModal
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title="Unsaved Changes"
        message="Are you sure you want to leave without saving your modifications?"
        confirmLabel="Yes, Exit"
        onConfirm={onBack}
      />
    </div>
  );
}
