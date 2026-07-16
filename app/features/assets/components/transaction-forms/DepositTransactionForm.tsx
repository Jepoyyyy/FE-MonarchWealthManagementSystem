import { useState } from "react";
import { Info, DollarSign, AlertTriangle } from "lucide-react";
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';

interface DepositFormProps {
  type: "buy" | "sell";
  rate: number; // annualReturn %
  onClose: () => void;
  onSubmit: (data: { amount: number; currentValue: number; quantity?: number }) => void;
}

export function DepositTransactionForm({ type, rate, onClose, onSubmit }: DepositFormProps) {
  const [amt, setAmt] = useState("");
  const [err, setErr] = useState("");

  const parsedAmt = parseFloat(amt) || 0;

  const handleSubmit = () => {
    if (!amt || parsedAmt <= 0) {
      setErr("Masukkan jumlah yang valid.");
      return;
    }
    onSubmit({ amount: parsedAmt, currentValue: parsedAmt });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2.5 rounded-md border border-border bg-muted/30">
        <Info size={14} className="flex-shrink-0" />
        <span>Interest Rate: {rate}% p.a. (Fixed)</span>
      </div>

      <InputField
        label="Amount (IDR)"
        type="number"
        value={amt}
        onChange={(e) => setAmt(e.target.value)}
        placeholder="e.g. 50000000"
        icon={<DollarSign size={14} />}
      />

      {err && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} /> {err}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        <Btn className="flex-1" onClick={handleSubmit}>{type === "buy" ? "Top Up Dep" : "Withdraw Dep"}</Btn>
      </div>
    </div>
  );
}
