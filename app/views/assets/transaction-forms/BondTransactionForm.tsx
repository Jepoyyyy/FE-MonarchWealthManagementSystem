import { useState } from "react";
import { TrendingUp, Layers, AlertTriangle, Check } from "lucide-react";
import { fmt } from "~/utils";
import { InputField } from "~/components/ui/InputField";
import { Btn } from "~/components/ui/Btn";

interface BondFormProps {
  type: "buy" | "sell";
  currentPrice: number; // Percentage of face value
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity: number }) => void;
}

export function BondTransactionForm({ type, currentPrice, onClose, onSubmit }: BondFormProps) {
  const [qty, setQty] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [err, setErr] = useState("");

  const parsedQty = parseFloat(qty) || 0;
  const totalAmt = parsedQty * (currentPrice / 100);
  const isValid = parsedQty > 0 && parsedQty % 1000000 === 0;

  const handleSubmit = () => {
    if (!qty || parsedQty <= 0) {
      setErr("Masukkan nominal pokok yang valid.");
      return;
    }
    if (!isValid) {
      setErr("Nominal pokok harus kelipatan IDR 1,000,000.");
      return;
    }
    onSubmit({ amount: totalAmt, currentValue: currentPrice, quantity: parsedQty });
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Nominal Pokok (IDR)"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="e.g. 10000000"
        icon={<Layers size={14} />}
      />

      <InputField
        label="Price (% of Face Value)"
        type="number"
        value={currentPrice.toString()}
        disabled
        icon={<TrendingUp size={14} />}
      />

      {parsedQty > 0 && (
        <>
          <p className="text-sm text-foreground">
            Total: <span className="font-bold font-mono">{fmt(Math.round(totalAmt))}</span>
          </p>
          {isValid ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Check size={12} /> Valid — kelipatan IDR 1,000,000
            </p>
          ) : (
            <p className="text-xs text-yellow-600">
              * Nominal pokok harus kelipatan IDR 1,000,000
            </p>
          )}
        </>
      )}

      <InputField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      {err && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} /> {err}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        <Btn className="flex-1" onClick={handleSubmit}>{type === "buy" ? "Buy Bond" : "Sell Bond"}</Btn>
      </div>
    </div>
  );
}
