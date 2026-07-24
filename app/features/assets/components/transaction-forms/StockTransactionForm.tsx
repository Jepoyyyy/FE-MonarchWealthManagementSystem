import { useState } from "react";
import { Layers, TrendingUp, AlertTriangle } from "lucide-react";
import { fmt } from "~/utils";
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';

interface StockFormProps {
  type: "buy" | "sell";
  currentPrice: number;
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity: number }) => void;
}

export function StockTransactionForm({ type, currentPrice, onClose, onSubmit }: StockFormProps) {
  const [qty, setQty] = useState("");
  const [priceInput, setPriceInput] = useState(currentPrice ? currentPrice.toString() : "");
  const [err, setErr] = useState("");

  const parsedQty = parseFloat(qty) || 0;
  const parsedPrice = parseFloat(priceInput) ?? currentPrice;
  const totalAmt = parsedQty * 100 * (isNaN(parsedPrice) ? 0 : parsedPrice);

  const handleSubmit = () => {
    if (!qty || qty.trim() === "") {
      setErr("Required field cannot be empty. Please enter quantity.");
      return;
    }
    if (parsedQty <= 0) {
      setErr("Invalid quantity. Quantity must be positive.");
      return;
    }
    if (parsedQty > 1e15) {
      setErr("Quantity is too large. Please enter a valid quantity.");
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
        label="Quantity (Lots)"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="e.g. 10"
        icon={<Layers size={14} />}
      />
      <InputField
        label="Price per share (IDR)"
        type="number"
        value={priceInput}
        onChange={(e) => setPriceInput(e.target.value)}
        placeholder="e.g. 5000"
        icon={<TrendingUp size={14} />}
      />

      {totalAmt > 0 && isFinite(totalAmt) && (
        <p className="text-sm text-foreground">
          Total: <span className="font-bold font-mono">{fmt(Math.round(totalAmt))}</span> ({parsedQty * 100} shares)
        </p>
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
