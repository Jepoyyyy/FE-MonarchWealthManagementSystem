import { useState, useEffect, useMemo } from "react";
import type { AppUser, Product, Asset, ProductType } from "~/types";
import { PRODUCT_SEED_PRICES } from '~/features/products/products.config';
import { maxRiskForProfile } from "~/utils";

interface UseTrackModalProps {
  user: AppUser;
  products: Product[];
  onSave: (a: Omit<Asset, "id">) => void;
  onClose: () => void;
  initialProduct?: Product;
}

const getFallbackPrice = (product: Product): number => {
  const seed = PRODUCT_SEED_PRICES[product.id];
  if (seed) return seed;
  if (product.type === "Bond" || product.type === "Sukuk") return 100;
  if (product.type === "Mutual Fund" || product.type === "Balanced Fund" || product.type === "Money Market") return 1000;
  if (product.type === "Stock") return 100;
  return 0;
};

export function useTrackModal({
  user,
  products,
  onSave,
  onClose,
  initialProduct,
}: UseTrackModalProps) {
  const [step, setStep] = useState<0 | 1>(initialProduct ? 1 : 0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [picked, setPicked] = useState<Product | null>(initialProduct ?? null);
  const [amount, setAmount] = useState("");
  const [currentVal, setCurrentVal] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [showConfirmCancelTrack, setShowConfirmCancelTrack] = useState(false);

  const userMaxRisk = maxRiskForProfile(user.riskProfile, false);
  const isStock = picked?.type === "Stock";
  const isDeposit = picked?.type === "Deposit";
  const isMF = picked?.type === "Money Market" || picked?.type === "Mutual Fund" || picked?.type === "Balanced Fund";
  const isBond = picked?.type === "Bond" || picked?.type === "Sukuk";

  const visible = useMemo(() => products.filter((p) => {
    if (!p.visible) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.issuer.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  }), [products, typeFilter, search]);

  const selectProduct = (p: Product) => {
    setPicked(p);
    setStep(1);
    setErr("");
    setAmount("");
    const price = getFallbackPrice(p);
    setCurrentVal(price > 0 ? String(price) : "");
    setQuantity("");
    setTenorMonths(12);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const parsedCurrentVal = parseFloat(currentVal) || 0;

  // Stock: amount = qty(lots) * 100 shares/lot * price
  useEffect(() => {
    if (!isStock || !picked || !quantity) {
      if (isStock) setAmount("");
      return;
    }
    const qty = parseFloat(quantity) || 0;
    if (parsedCurrentVal > 0 && qty > 0) {
      setAmount(String(qty * 100 * parsedCurrentVal));
    } else {
      setAmount("");
    }
  }, [quantity, currentVal, isStock, picked, parsedCurrentVal]);

  // MF/Bond: quantity = amount / price (with div-by-zero guard)
  useEffect(() => {
    if ((!isMF && !isBond) || !picked) return;
    if (!amount) {
      setQuantity("");
      setErr("");
      return;
    }
    const amt = parseFloat(amount) || 0;
    if (parsedCurrentVal > 0 && amt > 0) {
      setErr("");
      if (isMF) setQuantity((amt / parsedCurrentVal).toFixed(4));
      if (isBond) setQuantity((amt / (parsedCurrentVal / 100)).toFixed(4));
    } else {
      setQuantity("");
    }
  }, [amount, currentVal, isMF, isBond, picked, parsedCurrentVal]);

  const submit = () => {
    if (!picked) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErr("Enter the amount you invested.");
      return;
    }
    if (isStock && (!quantity || parseFloat(quantity) <= 0)) {
      setErr("Enter the quantity (lot).");
      return;
    }
    if ((isMF || isBond) && (parsedCurrentVal <= 0)) {
      setErr("Market price data unavailable for this product. Cannot auto-calculate units.");
      return;
    }
    const qtyVal = isDeposit ? amt : (parseFloat(quantity) || amt);
    const currentValNum = isDeposit ? amt : parsedCurrentVal;
    onSave({
      userId: user.id,
      productId: picked.id,
      amount: amt,
      currentValue: currentValNum || amt,
      quantity: qtyVal,
      purchaseDate: date,
      platform: platform.trim() || undefined,
      notes: notes.trim() || undefined,
      tenorMonths: isDeposit ? tenorMonths : undefined,
    });
  };

  return {
    step,
    setStep,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    picked,
    setPicked,
    amount,
    setAmount,
    currentVal,
    setCurrentVal,
    quantity,
    setQuantity,
    tenorMonths,
    setTenorMonths,
    date,
    setDate,
    platform,
    setPlatform,
    notes,
    setNotes,
    err,
    setErr,
    showConfirmCancelTrack,
    setShowConfirmCancelTrack,
    userMaxRisk,
    isStock,
    isDeposit,
    isMF,
    isBond,
    visible,
    selectProduct,
    parsedAmount,
    submit,
  };
}
