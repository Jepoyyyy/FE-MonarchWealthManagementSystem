import { useState } from "react";
import { Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Product, Asset, Goal, ProductType } from "~/types";
import { GOAL_TYPE_CONFIG } from '~/features/goals/goals.config';
import { fmt, fmtDate, fmtPct } from "~/utils";
import { ProductTypeBadge } from '~/features/products/components/ProductTypeBadge';
import { RiskLevelBadge } from '~/features/profile/components/RiskLevelBadge';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { Btn } from '~/shared/components/Button';

interface AssetRowProps {
  asset: Asset;
  products: Product[];
  goals: Goal[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAssignGoal: (assetId: string, goalId: string | undefined) => void;
}

export function AssetRow({ asset, products, goals, onSelect, onRemove, onAssignGoal }: AssetRowProps) {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const p = products.find((pr) => pr.id === asset.productId) || { name: "Unknown", issuer: "Unknown", type: "stock" as const, riskLevel: 1 };
  const qty = asset.quantity ?? asset.amount;
  const ret = ((asset.currentValue - asset.amount) / asset.amount) * 100;
  const { type } = p;

  const qtyLabel = type === "Stock"
    ? `${qty} Lot`
    : type === "Mutual Fund" || type === "Money Market" || type === "Balanced Fund"
      ? `${qty.toFixed(4)}`
      : type === "Deposit"
        ? "—"
        : fmt(Math.round(qty));

  return (
    <>
      <tr
        key={asset.id}
        onClick={() => onSelect(asset.id)}
        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <ProductTypeBadge type={p.type as ProductType} />
            <div>
              <p className="text-xs font-semibold leading-tight text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.issuer}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <RiskLevelBadge level={p.riskLevel} />
        </td>
        <td
          className="px-4 py-3 text-xs text-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {qtyLabel}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{asset.platform ?? "—"}</td>
        <td
          className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {fmtDate(asset.purchaseDate)}
        </td>
        <td
          className="px-4 py-3 text-xs text-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {fmt(asset.amount)}
        </td>
        <td
          className="px-4 py-3 text-xs font-semibold text-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {fmt(asset.currentValue)}
        </td>
        <td className="px-4 py-3">
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              ret >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {ret >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {fmtPct(ret)}
          </span>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <select
            value={asset.goalId ?? ""}
            onChange={(e) => onAssignGoal(asset.id, e.target.value || undefined)}
            className="text-xs rounded-md border px-2 py-1.5 max-w-32.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: asset.goalId ? "var(--accent)" : "var(--border)",
              background: "var(--input-background)",
              color: asset.goalId ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            <option value="">No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {GOAL_TYPE_CONFIG[g.type].icon} {g.name}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <Btn
            variant="unstyled"
            onClick={() => setConfirmRemoveId(asset.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all flex items-center justify-center"
            title="Hapus"
          >
            <Trash2 size={14} />
          </Btn>
        </td>
      </tr>

      <ConfirmModal
        open={!!confirmRemoveId}
        onOpenChange={() => setConfirmRemoveId(null)}
        title="Hapus posisi ini?"
        message="Data investasi ini akan dihapus permanen."
        confirmLabel="Ya, hapus"
        onConfirm={async () => {
          await onRemove(asset.id);
          setConfirmRemoveId(null);
        }}
      />
    </>
  );
}
