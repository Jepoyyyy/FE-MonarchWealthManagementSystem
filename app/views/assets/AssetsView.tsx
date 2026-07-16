import { useState } from "react";
import { Plus, Wallet, DollarSign, Percent, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { AppUser, Product, Asset, Goal, AuditLog } from "~/types";
import { fmt, fmtFull, fmtPct } from "~/utils";
import { PageHeader } from "~/components/ui/PageHeader";
import { StatCard } from "~/components/ui/StatCard";
import { Btn } from "~/components/ui/Btn";
import { TrackModal } from "~/views/products/TrackModal";
import { AssetDetailPage } from "./AssetDetailPage";
import { AssetRow } from "./AssetRow";
import { AssetApi } from "~/api/assets";
import { usePortfolioStore } from "~/stores/portfolioStore";
import { PortfolioService } from "~/services/portfolio";

interface AssetsViewProps {
  user: AppUser;
  products: Product[];
  addLog: (l: Omit<AuditLog, "id">) => void;
  goals: Goal[];
}

export function AssetsView({
  user,
  products,
  addLog,
  goals,
}: AssetsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [detailAssetId, setDetailAssetId] = useState<string | null>(null);
  const assets = usePortfolioStore((s) => s.assets);

  const myAssets = (assets || []).filter((a) => a.userId === user.id);
  const totalValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const totalCost = myAssets.reduce((s, a) => s + a.amount, 0);
  const totalGain = totalValue - totalCost;
  const totalRetPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const saveAsset = async (data: Omit<Asset, "id">) => {
    try {
      await AssetApi.create(data);
      await usePortfolioStore.getState().fetchPortfolio();
      setShowAdd(false);
    } catch {}
  };

  const updateAsset = async (id: string, data: Partial<Asset>, txType?: "buy" | "sell", txQty?: number, txPrice?: number) => {
    try {
      await AssetApi.update(id, data);
      await usePortfolioStore.getState().fetchPortfolio();
    } catch {}
  };

  const removeAsset = async (id: string) => {
    try {
      await AssetApi.delete(id);
      await usePortfolioStore.getState().fetchPortfolio();
    } catch {}
  };

  const assignGoal = (assetId: string, goalId: string | undefined) => {
    // local-only until goal-linking API endpoint is available
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
          <table className="w-full text-sm min-w-200">
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
              {myAssets.map((a) => (
                <AssetRow
                  key={a.id}
                  asset={a}
                  products={products}
                  goals={goals}
                  onSelect={setDetailAssetId}
                  onRemove={removeAsset}
                  onAssignGoal={assignGoal}
                />
              ))}
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
