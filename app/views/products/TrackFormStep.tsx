import { DollarSign, TrendingUp, Percent, Layers, Briefcase, AlertTriangle } from "lucide-react";
import type { Product, ProductType } from "~/types";
import { depositTenors } from "~/config/products";
import { fmt } from "~/utils";
import { getProductTypeIcon, getRiskLevelLabel, getRiskLevelBadgeClass } from "~/utils/productHelpers";
import { InputField } from '~/shared/components/Input';
import { Badge } from '~/shared/components/Badge';

interface TrackFormStepProps {
  picked: Product | null;
  amount: string;
  setAmount: (val: string) => void;
  currentVal: string;
  quantity: string;
  setQuantity: (val: string) => void;
  isStock: boolean;
  isDeposit: boolean;
  isMF: boolean;
  isBond: boolean;
  parsedAmount: number;
  tenorMonths: number;
  setTenorMonths: (val: number) => void;
  date: string;
  setDate: (val: string) => void;
  platform: string;
  setPlatform: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  err: string;
}

export function TrackFormStep({
  picked,
  amount,
  setAmount,
  currentVal,
  quantity,
  setQuantity,
  isStock,
  isDeposit,
  isMF,
  isBond,
  tenorMonths,
  setTenorMonths,
  date,
  setDate,
  platform,
  setPlatform,
  notes,
  setNotes,
  err,
}: TrackFormStepProps) {
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Selected product summary */}
      {picked && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted border border-border">
          <span className="text-2xl">{getProductTypeIcon(picked.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{picked.name}</p>
            <p className="text-xs text-muted-foreground">{picked.issuer} · {picked.annualReturn}% p.a. stated</p>
          </div>
          <Badge className={getRiskLevelBadgeClass(picked.riskLevel)}>{getRiskLevelLabel(picked.riskLevel)}</Badge>
        </div>
      )}

      {/* Amount Invested — Stock: ReadOnly, others: Editable */}
      <div>
        {isStock ? (
          <InputField
            label="Amount Invested (IDR)"
            type="number" value={amount}
            readOnly
            placeholder="Auto-calculated"
            icon={<DollarSign size={14} />}
            rightElement="[ Auto-Calc ]"
          />
        ) : (
          <InputField
            label="Amount Invested (IDR)"
            type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 10000000"
            icon={<DollarSign size={14} />}
          />
        )}
      </div>

      {/* Current Market Value — from system seed */}
      {isDeposit ? (
        <div className="p-3 rounded-lg bg-muted border border-border">
          <p className="text-xs text-muted-foreground">Expected Return</p>
          <p className="text-sm font-bold mt-0.5 font-mono text-foreground">
            {picked?.issuer ?? picked?.name} · {picked?.annualReturn ?? 5.0}% p.a.
          </p>
        </div>
      ) : isStock ? (
        <InputField
          label="Current Market Price (per share)"
          type="number" value={currentVal}
          readOnly={true}
          placeholder="From market data"
          icon={<TrendingUp size={14} />}
          rightElement="[ Market Data ]"
        />
      ) : isMF ? (
        <InputField
          label="Current NAV / Unit Price"
          type="number" value={currentVal}
          readOnly={true}
          placeholder="From market data"
          icon={<TrendingUp size={14} />}
          rightElement="[ Market Data ]"
        />
      ) : isBond ? (
        <InputField
          label="Current Price (% of face value)"
          type="number" value={currentVal} step={0.01}
          readOnly={true}
          placeholder="From market data"
          icon={<Percent size={14} />}
          rightElement="[ Market Data ]"
        />
      ) : null}

      {/* Quantity — Stock: Editable Lot, MF/Bond: ReadOnly */}
      {!isDeposit && (
        <div>
          {isStock ? (
            <InputField
              label="Quantity (Lot)"
              type="number" min={1} step={1} value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="e.g. 1"
              icon={<Layers size={14} />}
            />
          ) : isMF ? (
            <InputField
              label="Owned Units"
              type="number" value={quantity}
              readOnly
              placeholder="Auto-calculated"
              icon={<Layers size={14} />}
              rightElement="[ Auto-Calc ]"
            />
          ) : isBond ? (
            <InputField
              label="Nominal Pokok (IDR)"
              type="number" value={quantity}
              readOnly
              placeholder="Auto-calculated"
              icon={<Layers size={14} />}
              rightElement="[ Auto-Calc ]"
            />
          ) : null}

          {isBond && picked && picked.minInvestment > 0 && (() => {
            const p = picked;
            const m = p.minInvestment;
            const nominal = parseFloat(quantity) || 0;
            const isValid = nominal > 0 && nominal % m === 0;
            return nominal > 0 ? (
              <p className={`text-xs mt-0.5 ${isValid ? "text-emerald-600" : "text-red-500"}`}>
                {isValid
                  ? `Valid — kelipatan ${fmt(m)}`
                  : `Harus kelipatan ${fmt(m)}`}
              </p>
            ) : null;
          })()}
        </div>
      )}

      {/* Tenor — Deposit */}
      {isDeposit && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Tenor</label>
          <div className="flex gap-2">
            {depositTenors.map(t => (
              <button key={t.months} onClick={() => setTenorMonths(t.months)}
                className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${tenorMonths === t.months ? "border-primary bg-primary/5" : "border-border bg-muted hover:border-primary/30"}`}>
                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.return}% p.a.</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bond tenor info */}
      {isBond && picked?.tenor && (
        <div className="p-3 rounded-lg bg-muted border border-border">
          <p className="text-xs text-muted-foreground">Tenor</p>
          <p className="text-sm font-semibold mt-0.5 text-foreground">{picked.tenor}</p>
        </div>
      )}

      <InputField label="Purchase Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

      <InputField
        label="Platform / Broker (optional)"
        value={platform} onChange={e => setPlatform(e.target.value)}
        placeholder="e.g. Bibit, Bareksa, IPOT, Tokopedia Emas…"
        icon={<Briefcase size={14} />}
      />

      <InputField
        label="Notes (optional)"
        value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="e.g. Dollar-cost average entry, long-term hold…"
      />

      {err && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}
    </div>
  );
}
