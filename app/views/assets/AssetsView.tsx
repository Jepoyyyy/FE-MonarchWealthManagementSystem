import { useState, useMemo, useCallback } from "react";
import { Plus, Wallet, DollarSign, Percent, Briefcase, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { AppUser, Product, Asset, Goal } from "~/types";
import { GOAL_TYPE_CONFIG } from "~/data";
import { fmt, fmtDate, fmtFull, fmtPct } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { ConfirmModal } from "~/components/ui/ConfirmModal";
import { Badge } from "~/components/ui/Badge";
import { Btn } from "~/components/ui/Btn";
import { TrackModal } from "~/views/products/TrackModal";
import { AssetDetailPage } from "./AssetDetailPage";
import { PortfolioService } from "~/services/portfolio";

interface AssetsViewProps {
  user: AppUser;
  products: Product[];
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  addLog: (l: any) => void;
  goals: Goal[];
  investableSurplus: number;
}

export function AssetsView({
  user,
  products,
  assets,
  setAssets,
  addLog,
  goals,
  investableSurplus,
}: AssetsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [detailAssetId, setDetailAssetId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const myAssets = useMemo(() => (assets || []).filter((a) => a.userId === user.id), [assets, user.id]);
  const totalValue = useMemo(() => myAssets.reduce((s, a) => s + a.currentValue, 0), [myAssets]);
  const totalCost = useMemo(() => myAssets.reduce((s, a) => s + a.amount, 0), [myAssets]);
  const totalGain = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);
  const totalRetPct = useMemo(() => (totalCost > 0 ? (totalGain / totalCost) * 100 : 0), [totalGain, totalCost]);

  const saveAsset = (data: Omit<Asset, "id">) => {
    const p = products.find((pr) => pr.id === data.productId)!;
    const newAsset: Asset = { ...data, id: `a${Date.now()}` };
    setAssets((prev) => [...prev, newAsset]);
    addLog({
      userId: user.id,
      userName: user.name,
      action: "ADD_ASSET",
      details: `Tracked ${p.name} — ${fmtFull(data.amount)} via ${data.platform || "external platform"}`,
      timestamp: new Date().toISOString(),
      category: "portfolio",
    });
    setShowAdd(false);
  };

  const updateAsset = (id: string, data: Partial<Asset>, txType?: "buy" | "sell", txQty?: number, txPrice?: number) => {
    const a = assets.find((x) => x.id === id)!;
    const p = products.find((pr) => pr.id === a.productId)!;

    const newData = txType && txPrice !== undefined
      ? { ...data, ...PortfolioService.processTransaction(a, p, txType, data.amount ?? 0, txPrice, txQty) }
      : data;

    setAssets((prev) => prev.map((x) => (x.id === id ? { ...x, ...newData } : x)));
    addLog({
      userId: user.id,
      userName: user.name,
      action: "UPDATE_ASSET",
      details: txType
        ? `${txType === "buy" ? "Top Up" : "Redeem"} ${p.name}`
        : `Updated ${p?.name ?? "position"} detail`,
      timestamp: new Date().toISOString(),
      category: "portfolio",
    });
  };

  const removeAsset = (id: string) => {
    const a = assets.find((x) => x.id === id)!;
    const p = products.find((pr) => pr.id === a.productId);
    setAssets((prev) => prev.filter((x) => x.id !== id));
    addLog({
      userId: user.id,
      userName: user.name,
      action: "REMOVE_ASSET",
      details: `Removed ${p?.name ?? "position"} from portfolio`,
      timestamp: new Date().toISOString(),
      category: "portfolio",
    });
    setConfirmRemoveId(null);
  };

  const assignGoal = (assetId: string, goalId: string | undefined) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, goalId } : a)));
  };

  const detailAsset = detailAssetId ? myAssets.find((a) => a.id === detailAssetId) : null;
  const detailProduct = detailAsset ? products.find((p) => p.id === detailAsset.productId) : null;

  if (detailAsset && detailProduct) {
    return (
      <AssetDetailPage
        asset={detailAsset}
        product={detailProduct}
        goals={goals}
        onSave={updateAsset}
        onDelete={removeAsset}
        onBack={() => setDetailAssetId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assets"
        subtitle="Record and track investments made through any platform"
        action={
          <Btn onClick={() => setShowAdd(true)} size="sm">
            <Plus size={14} /> Track Investment
          </Btn>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard
          label="Portfolio Value"
          value={fmt(totalValue)}
          sub={`${fmtPct(totalRetPct)} total return`}
          icon={<Wallet size={16} />}
          trend={totalValue >= totalCost ? "up" : "down"}
        />
        <StatCard label="Total Cost Basis" value={fmt(totalCost)} icon={<DollarSign size={16} />} />
        <StatCard
          label="Unrealized P&L"
          value={fmt(Math.abs(totalGain))}
          sub={totalGain >= 0 ? "Gain" : "Loss"}
          icon={<Percent size={16} />}
          trend={totalGain >= 0 ? "up" : "down"}
        />
      </div>

      {showAdd && (
        <TrackModal
          user={user}
          products={products}
          onSave={saveAsset}
          onClose={() => setShowAdd(false)}
          investableSurplus={investableSurplus}
        />
      )}
      {confirmRemoveId && (
        <ConfirmModal
          open={!!confirmRemoveId}
          onOpenChange={() => setConfirmRemoveId(null)}
          title="Hapus posisi ini?"
          message="Data investasi ini akan dihapus permanen."
          confirmLabel="Ya, hapus"
          onConfirm={() => removeAsset(confirmRemoveId!)}
        />
      )}

      {myAssets.length === 0 ? (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 text-center">
          <Briefcase size={36} className="text-muted-foreground mb-3" />
          <p className="font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
            No positions tracked yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
            Record investments you've made through Bibit, Bareksa, IPOT, or any other broker to consolidate your portfolio here.
          </p>
          <Btn size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Track Your First Investment
          </Btn>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Product", "Risk", "Qty", "Platform", "Date", "Cost Basis", "Cur Value", "P/L", "Goals", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => {
                const p = products.find((pr) => pr.id === a.productId) || { name: 'Unknown', issuer: 'Unknown', type: 'stock', riskLevel: 1 };
                const qty = a.quantity ?? a.amount;
                const ret = ((a.currentValue - a.amount) / a.amount) * 100;
                const isStock2 = p.type === "stock";
                const isMF2 = p.type === "mutual_fund" || p.type === "money_market";
                const isDeposit2 = p.type === "deposit";
                const qtyLabel2 = isStock2 ? `${qty} Lot` : isMF2 ? `${qty.toFixed(4)}` : isDeposit2 ? "—" : fmt(Math.round(qty));
                return (
                  <tr
                    key={a.id}
                    onClick={() => setDetailAssetId(a.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProductTypeBadge type={p.type} />
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
                      {qtyLabel2}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.platform ?? "—"}</td>
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmtDate(a.purchaseDate)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmt(a.amount)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmt(a.currentValue)}
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
                        value={a.goalId ?? ""}
                        onChange={(e) => assignGoal(a.id, e.target.value || undefined)}
                        className="text-xs rounded-md border px-2 py-1.5 max-w-[130px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                        style={{
                          borderColor: a.goalId ? "var(--accent)" : "var(--border)",
                          background: "var(--input-background)",
                          color: a.goalId ? "var(--foreground)" : "var(--muted-foreground)",
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
                        onClick={() => setConfirmRemoveId(a.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--muted)", borderTop: "2px solid var(--border)" }}>
                <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-foreground">
                  Total · {myAssets.length} position{myAssets.length !== 1 ? "s" : ""}
                </td>
                <td
                  className="px-4 py-3 text-xs font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fmt(totalCost)}
                </td>
                <td
                  className="px-4 py-3 text-xs font-bold text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fmt(totalValue)}
                </td>
                <td className="px-4 py-3" colSpan={3}>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 ${
                      totalRetPct >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {totalRetPct >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {fmtPct(totalRetPct)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
