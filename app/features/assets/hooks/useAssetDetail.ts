import { useState } from "react";
import type { Asset, Product } from "~/types";
import { PortfolioService } from '~/features/assets/portfolio.service';

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

  const isStock = product.type === "stock";
  const isMF = product.type === "mutual_fund" || product.type === "money_market";
  const isBond = product.type === "bond";
  const isDeposit = product.type === "deposit";

  const lotNum = parseFloat(lot) || 1;
  const curValNum = asset.currentValue;

  const avgVal = PortfolioService.calculateAverageValue(asset);
  const currentAssetValue = PortfolioService.calculateCurrentValue(asset, product, lotNum);
  const { pnlAmt, pnlPct } = PortfolioService.calculatePNL(asset.amount, currentAssetValue, avgVal, curValNum);

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
    curValNum,
    avgVal,
    currentAssetValue,
    pnlAmt,
    pnlPct,
    hasChanges,
    handleSave,
  };
}
