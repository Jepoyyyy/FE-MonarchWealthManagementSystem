import { useState } from "react";
import type { Asset, Product } from "~/types";
import { usePortfolioStore } from "~/features/assets/portfolio.store";

interface UseAssetDetailProps {
  asset: Asset;
  product: Product;
  onSave: (id: string, data: Partial<Asset>, txType?: "buy" | "sell", txQty?: number, txPrice?: number) => void;
  onBack: () => void;
}

export function useAssetDetail({
  asset,
  product,
  onSave,
  onBack,
}: UseAssetDetailProps) {
  const [goalId, setGoalId] = useState(asset.goalId ?? "");
  const [lot, setLot] = useState(String(asset.quantity ?? 1));
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showTxModal, setShowTxModal] = useState<"buy" | "sell" | null>(null);

  const { pnlData } = usePortfolioStore();
  const pnl = pnlData.find((x) => x.assetId === asset.id);

  const isStock = product.type === "Stock";
  const isMF = product.type === "Mutual Fund" || product.type === "Money Market" || product.type === "Balanced Fund";
  const isBond = product.type === "Bond" || product.type === "Sukuk";
  const isDeposit = product.type === "Deposit";

  const lotNum = pnl ? pnl.units : (asset.quantity ?? 1);
  const avgVal = pnl ? pnl.avg_price : (asset.quantity && asset.quantity > 0 ? asset.amount / asset.quantity : asset.amount);
  const currentAssetValue = pnl ? pnl.currentValue : asset.currentValue;

  const pnlAmt = pnl ? pnl.potential_pnl : (currentAssetValue - asset.amount);
  const pnlPct = pnl ? pnl.potential_pnl_percent : (avgVal > 0 ? ((product.currentPrice - avgVal) / avgVal) * 100 : 0);

  const hasChanges = goalId !== (asset.goalId ?? "") || lot !== String(asset.quantity ?? 1);

  const handleSave = () => {
    if (!hasChanges) {
      onBack();
      return;
    }
    onSave(asset.id, {
      goalId: goalId || undefined,
      quantity: isDeposit ? undefined : lotNum,
    });
    onBack();
  };

  const qtyLabel = isStock ? "Owned Lot" : isMF ? "Owned Units" : isBond ? "Nominal Pokok" : "Quantity";

  return {
    goalId,
    setGoalId,
    lot,
    setLot,
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
    curValNum: pnl ? pnl.currentValue : asset.currentValue,
    avgVal,
    currentAssetValue,
    pnlAmt,
    pnlPct,
    hasChanges,
    handleSave,
  };
}
