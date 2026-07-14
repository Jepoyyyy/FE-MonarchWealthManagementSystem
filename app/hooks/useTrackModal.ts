import { useState, useEffect } from "react";
import type { AppUser, Product, Asset, ProductType } from "~/types";
import { PRODUCT_SEED_PRICES } from "~/data";
import { maxRiskForProfile } from "~/utils";

interface UseTrackModalProps {
  user: AppUser;
  products: Product[];
  onSave: (a: Omit<Asset, "id">) => void;
  onClose: () => void;
  initialProduct?: Product;
  investableSurplus?: number;
}

export function useTrackModal({
  user,
  products,
  onSave,
  onClose,
  initialProduct,
  investableSurplus,
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
  const isStock = picked?.type === "stock";
  const isDeposit = picked?.type === "deposit";
  const isMF = picked?.type === "mutual_fund" || picked?.type === "money_market";
  const isBond = picked?.type === "bond";

  const visible = products.filter((p) => {
    if (!p.visible) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.issuer.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const selectProduct = (p: Product) => {
    setPicked(p);
    setStep(1);
    setErr("");
    setAmount("");
    setCurrentVal(String(PRODUCT_SEED_PRICES[p.id] ?? ""));
    setQuantity("");
    setTenorMonths(12);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const parsedCurrentVal = parseFloat(currentVal) || 0;

  // Auto-calculations based on type
  useEffect(() => {
    if (!isStock || !picked || !quantity) return;
    const qty = parseFloat(quantity) || 0;
    if (parsedCurrentVal > 0) {
      setAmount(String(qty * 100 * parsedCurrentVal));
    }
  }, [quantity, currentVal, isStock, picked, parsedCurrentVal]);

  useEffect(() => {
    if ((!isMF && !isBond) || !picked || !amount) return;
    const amt = parseFloat(amount) || 0;
    if (parsedCurrentVal > 0) {
      if (isMF) setQuantity((amt / parsedCurrentVal).toFixed(4));
      if (isBond) setQuantity(String(Math.round(amt / (parsedCurrentVal / 100) / 10000) * 10000));
    }
  }, [amount, currentVal, isMF, isBond, picked, parsedCurrentVal]);

  const submit = () => {
    if (!picked) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErr("Enter the amount you invested.");
      return;
    }
    if (investableSurplus !== undefined && amt > investableSurplus) {
      setErr(`Amount exceeds your investable surplus of ${amount}.`);
      return;
    }
    const qtyVal = isDeposit ? amt : parseFloat(quantity) || undefined;
    const currentValNum = isDeposit ? amt : parseFloat(currentVal);
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
    parsedCurrentVal,
    submit,
  };
}
