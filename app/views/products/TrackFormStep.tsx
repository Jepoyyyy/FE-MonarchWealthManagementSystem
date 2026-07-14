import { DollarSign, TrendingUp, Percent, Layers, Briefcase, AlertTriangle } from "lucide-react";
import type { Product } from "~/types";
import { depositTenors } from "~/data";
import { fmt } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { Btn } from "~/components/ui/Btn";
import { InputField } from "~/components/ui/InputField";

interface TrackFormStepProps {
  picked: Product | null;
  investableSurplus?: number;
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
  investableSurplus,
  amount,
  setAmount,
  currentVal,
  quantity,
  setQuantity,
  isStock,
  isDeposit,
  isMF,
  isBond,
  parsedAmount,
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
      {picked && (
        <div
          className="flex items-center gap-3 p-3.5 rounded-xl bg-muted border border-border"
        >
          <ProductTypeBadge type={picked.type} />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate text-foreground"
            >
              {picked.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {picked.issuer} · {picked.annualReturn}% p.a. stated
            </p>
          </div>
          <RiskLevelBadge level={picked.riskLevel} />
        </div>
      )}

      {investableSurplus !== undefined && (
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <span className="text-xs font-medium text-emerald-700">Investable Surplus</span>
          <span
            className="text-sm font-bold text-emerald-700"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fmt(investableSurplus)}
          </span>
        </div>
      )}

      <div>
        {isStock ? (
          <InputField
            label="Amount Invested (IDR)"
            type="number"
            value={amount}
            onChange={() => {}}
            placeholder="Auto-calculated"
            icon={<DollarSign size={14} />}
            readOnly
          />
        ) : (
          <InputField
            label="Amount Invested (IDR)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10000000"
            icon={<DollarSign size={14} />}
          />
        )}
        {investableSurplus !== undefined && parsedAmount > 0 && parsedAmount > investableSurplus && (
          <p className="text-xs text-red-500 mt-1">
            Exceeds surplus by {fmt(parsedAmount - investableSurplus)}
          </p>
        )}
      </div>

      {isDeposit ? (
        <div
          className="p-3 rounded-lg bg-muted border border-border"
        >
          <p className="text-xs text-muted-foreground">Expected Return</p>
          <p
            className="text-sm font-bold mt-0.5 text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {picked?.annualReturn ?? 5.0}% p.a.
          </p>
        </div>
      ) : isStock ? (
        <InputField
          label="Current Market Price (per share)"
          type="number"
          value={currentVal}
          readOnly
          placeholder="From market data"
          icon={<TrendingUp size={14} />}
        />
      ) : isMF ? (
        <InputField
          label="Current NAV / Unit Price"
          type="number"
          value={currentVal}
          readOnly
          placeholder="From market data"
          icon={<TrendingUp size={14} />}
        />
      ) : isBond ? (
        <InputField
          label="Current Price (% of face value)"
          type="number"
          value={currentVal}
          step={0.01}
          readOnly
          placeholder="From market data"
          icon={<Percent size={14} />}
        />
      ) : null}

      {!isDeposit && (
        <div>
          {isStock ? (
            <InputField
              label="Quantity (Lot)"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 1"
              icon={<Layers size={14} />}
            />
          ) : isMF ? (
            <InputField
              label="Owned Units"
              type="number"
              value={quantity}
              onChange={() => {}}
              placeholder="Auto-calculated"
              icon={<Layers size={14} />}
              readOnly
            />
          ) : isBond ? (
            <InputField
              label="Nominal Pokok (IDR)"
              type="number"
              value={quantity}
              onChange={() => {}}
              placeholder="Auto-calculated"
              icon={<Layers size={14} />}
              readOnly
            />
          ) : null}

          {isBond && parsedAmount > 0 && picked && picked.minInvestment > 0 && (
            <p
              className={`text-xs mt-0.5 ${
                parsedAmount % picked.minInvestment === 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {parsedAmount % picked.minInvestment === 0
                ? `Valid — kelipatan ${fmt(picked.minInvestment)}`
                : `Harus kelipatan ${fmt(picked.minInvestment)}`}
            </p>
          )}
        </div>
      )}

      {isDeposit && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Tenor</label>
          <div className="flex gap-2">
            {depositTenors.map((t) => (
              <Btn
                variant="unstyled"
                key={t.months}
                type="button"
                onClick={() => setTenorMonths(t.months)}
                className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                  tenorMonths === t.months
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.return}% p.a.</p>
              </Btn>
            ))}
          </div>
        </div>
      )}

      {isBond && picked?.tenor && (
        <div
          className="p-3 rounded-lg bg-muted border border-border"
        >
          <p className="text-xs text-muted-foreground">Tenor</p>
          <p className="text-sm font-semibold mt-0.5 text-foreground">{picked.tenor}</p>
        </div>
      )}

      <InputField
        label="Purchase Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <InputField
        label="Platform / Broker (optional)"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        placeholder="e.g. Bibit, Bareksa, IPOT, Tokopedia Emas…"
        icon={<Briefcase size={14} />}
      />

      <InputField
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Dollar-cost average entry, long-term hold…"
        icon={<Briefcase size={14} />}
      />

      {err && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} />
          {err}
        </p>
      )}
    </div>
  );
}
