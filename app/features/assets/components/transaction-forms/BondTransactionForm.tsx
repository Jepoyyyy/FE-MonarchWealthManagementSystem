import { useState } from "react";
import { TrendingUp, Layers, AlertTriangle, Check } from "lucide-react";
import { fmt } from "~/utils";
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';

interface BondFormProps {
  type: "buy" | "sell";
  currentPrice: number; // Percentage of face value
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity: number }) => void;
}

export function BondTransactionForm({ type, currentPrice, onClose, onSubmit }: BondFormProps) {
  const [qty, setQty] = useState("");
  const [priceInput, setPriceInput] = useState(currentPrice ? currentPrice.toString() : "");
  const [err, setErr] = useState("");

  const parsedQty = parseFloat(qty) || 0;
  const parsedPrice = parseFloat(priceInput) ?? currentPrice;
  const totalAmt = parsedQty * ((isNaN(parsedPrice) ? currentPrice : parsedPrice) / 100);
  const isValid = parsedQty > 0 && parsedQty % 1000000 === 0;

  const handleSubmit = () => {
    if (!qty || qty.trim() === "") {
      setErr("Required field cannot be empty. Please enter principal amount.");
      return;
    }
    if (parsedQty <= 0) {
      setErr("Invalid quantity. Principal amount must be positive.");
      return;
    }
    if (parsedQty > 1e15) {
      setErr("Quantity is too large. Please enter a valid principal amount.");
      return;
    }
    if (!isValid) {
      setErr("Principal amount must be in multiples of IDR 1,000,000.");
      return;
    }
    if (priceInput !== "" && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      setErr("Invalid price. Price must be greater than zero.");
      return;
    }
    onSubmit({ amount: totalAmt, currentValue: parsedPrice || currentPrice, quantity: parsedQty });
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Principal Amount / Quantity (IDR)"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="e.g. 10000000"
        icon={<Layers size={14} />}
      />

      <InputField
        label="Price (% of Face Value)"
        type="number"
        value={priceInput}
        onChange={(e) => setPriceInput(e.target.value)}
        placeholder="e.g. 100"
        icon={<TrendingUp size={14} />}
      />

      {parsedQty > 0 && isFinite(totalAmt) && (
        <>
          <p className="text-sm text-foreground">
            Total: <span className="font-bold font-mono">{fmt(Math.round(totalAmt))}</span>
          </p>
          {isValid ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Check size={12} /> Valid — multiple of IDR 1,000,000
            </p>
          ) : (
            <p className="text-xs text-yellow-600">
              * Principal amount must be in multiples of IDR 1,000,000
            </p>
          )}
        </>
      )}

      {err && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} /> {err}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        <Btn className="flex-1" onClick={handleSubmit}>Submit</Btn>
      </div>
    </div>
  );
}
