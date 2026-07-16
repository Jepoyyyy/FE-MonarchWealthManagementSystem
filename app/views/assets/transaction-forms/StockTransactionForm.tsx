import { useState } from "react";
import { Layers, TrendingUp, AlertTriangle } from "lucide-react";
import { fmt } from "~/utils";
import { InputField } from "~/components/ui/InputField";
import { Btn } from "~/components/ui/Btn";

interface StockFormProps {
  type: "buy" | "sell";
  currentPrice: number;
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity: number }) => void;
}

export function StockTransactionForm({ type, currentPrice, onClose, onSubmit }: StockFormProps) {
  const [qty, setQty] = useState("");
  const [err, setErr] = useState("");

  const parsedQty = parseFloat(qty) || 0;
  const totalAmt = parsedQty * 100 * currentPrice;

  const handleSubmit = () => {
    if (!qty || parsedQty <= 0) {
      setErr("Masukkan jumlah lot yang valid.");
      return;
    }
    onSubmit({ amount: totalAmt, currentValue: currentPrice, quantity: parsedQty });
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Jumlah Lot"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="e.g. 10"
        icon={<Layers size={14} />}
      />
      <InputField
        label="Price per share (IDR)"
        type="number"
        value={currentPrice.toString()}
        disabled
        icon={<TrendingUp size={14} />}
      />

      {totalAmt > 0 && (
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
        <Btn className="flex-1" onClick={handleSubmit}>{type === "buy" ? "Buy Stocks" : "Sell Stocks"}</Btn>
      </div>
    </div>
  );
}
