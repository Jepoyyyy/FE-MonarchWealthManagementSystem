import { useState } from "react";
import { TrendingUp, Layers, AlertTriangle } from "lucide-react";
import { fmt } from "~/utils";
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';

interface MutualFundFormProps {
  type: "buy" | "sell";
  currentPrice: number; 
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity: number; method: "amount" | "units" }) => void;
}

export function MutualFundTransactionForm({ type, currentPrice, onClose, onSubmit }: MutualFundFormProps) {
  const [method, setMethod] = useState<"amount" | "units">("units");
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  const parsedVal = parseFloat(val) || 0;

  const totalAmt = method === "amount" ? parsedVal : parsedVal * currentPrice;
  const units = method === "units" ? parsedVal : parsedVal / currentPrice;

  const handleSubmit = () => {
    if (!val || parsedVal <= 0) {
      setErr("Masukkan nilai yang valid.");
      return;
    }
    onSubmit({ amount: totalAmt, currentValue: currentPrice, quantity: units, method });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium block mb-1.5 text-foreground">
          {type === "buy" ? "Top Up Method" : "Redemption Method"}
        </label>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="radio" checked={method === "amount"} onChange={() => { setMethod("amount"); setVal(""); }} className="accent-primary" />
            Amount (IDR)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="radio" checked={method === "units"} onChange={() => { setMethod("units"); setVal(""); }} className="accent-primary" />
            Units
          </label>
        </div>
      </div>

      <InputField
        label={method === "amount" ? "Total Amount (IDR)" : "Jumlah Units"}
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={method === "amount" ? "e.g. 1000000" : "e.g. 120.45"}
        icon={<Layers size={14} />}
      />

      <InputField
        label="NAV / Unit Price"
        type="number"
        value={currentPrice.toString()}
        disabled
        icon={<TrendingUp size={14} />}
      />

      {parsedVal > 0 && (
        <p className="text-sm text-foreground">
          Total: <span className="font-bold font-mono">{fmt(Math.round(totalAmt))}</span>
        </p>
      )}

      {err && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} /> {err}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        <Btn className="flex-1" onClick={handleSubmit}>{type === "buy" ? "Buy Units" : "Sell Units"}</Btn>
      </div>
    </div>
  );
}
