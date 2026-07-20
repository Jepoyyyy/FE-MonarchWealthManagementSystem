import { useState } from "react";
import { Plus, Wallet, DollarSign, Percent, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { AppUser, Product, Asset, Goal, AuditLog } from "~/types";
import { fmt, fmtPct } from "~/utils";
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Btn } from '~/shared/components/Button';
import { TrackModal } from '~/features/products/components/TrackModal';
import { AssetDetailPage } from "./AssetDetailPage";
import { AssetRow } from "./AssetRow";
import { AssetApi } from '~/features/assets/api';
import { ProductApi } from '~/features/products';
import { usePortfolioStore } from '~/features/assets/portfolio.store';
import { useGoalsStore } from '~/features/goals/goals.store';
import { handleGlobalApiError } from '~/shared/api';
import { toast } from 'sonner';

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const assets = usePortfolioStore((s) => s.assets);

  const myAssets = (assets || []).filter((a) => a.userId === user.id);
  const totalValue = myAssets.reduce((s, a) => s + a.currentValue, 0);
  const totalCost = myAssets.reduce((s, a) => s + a.amount, 0);
  const totalGain = totalValue - totalCost;
  const totalRetPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const saveAsset = async (data: Omit<Asset, "id">) => {
    try {
      await AssetApi.create(data, products);
      await usePortfolioStore.getState().fetchPortfolio();
      await useGoalsStore.getState().fetchGoals();
      await useGoalsStore.getState().fetchProjections();
      setShowAdd(false);
      toast.success("Aset berhasil ditambahkan");
    } catch (err: any) {
      if (!handleGlobalApiError(err)) {
        toast.error("Gagal menambahkan aset", { description: err.message || "Unknown error" });
      }
    }
  };

  const updateAsset = async (id: string, data: Partial<Asset>, txType?: "buy" | "sell", txQty?: number, txPrice?: number, txMethod?: "amount" | "units") => {
    try {
      if (txType && txQty !== undefined && txPrice !== undefined) {
        // Derive productId from store assets (not stale closure myAssets)
        const storeAssets = usePortfolioStore.getState().assets;
        const asset = storeAssets.find(a => a.id === id);
        const p = (asset ? products.find((prod) => prod.id === asset.productId) : undefined) || selectedProduct;
        const action = txType === "buy" ? "BUY" : "SELL";
        const ptype = p?.type;
        const payload: { action: string; units?: number; amount?: number } = { action };

        if (ptype === "Stock") {
          payload.units = txQty * 100; // lots → units (shares)
        } else if (ptype === "Mutual Fund" || ptype === "Money Market" || ptype === "Balanced Fund") {
          if (txMethod === "amount") {
            payload.amount = data.amount; // transaction by rupiah amount
          } else {
            payload.units = txQty; // transaction by units
          }
        } else if (ptype === "Bond" || ptype === "Sukuk") {
          payload.units = txQty; // nominal pokok
        } else {
          payload.amount = data.amount; // Deposit
        }
        await AssetApi.addTransaction(id, payload);
      } else {
        await AssetApi.update(id, data, products);
      }
      await usePortfolioStore.getState().fetchPortfolio();
      await useGoalsStore.getState().fetchGoals();
      await useGoalsStore.getState().fetchProjections();
      toast.success("Aset berhasil diperbarui");
    } catch (err: any) {
      if (!handleGlobalApiError(err)) {
        toast.error("Gagal memperbarui aset", { description: err.message || "Unknown error" });
      }
    }
  };

  const removeAsset = async (id: string) => {
    try {
      await AssetApi.delete(id);
      await usePortfolioStore.getState().fetchPortfolio();
      await useGoalsStore.getState().fetchGoals();
      await useGoalsStore.getState().fetchProjections();
      toast.success("Aset berhasil dihapus");
    } catch (err: any) {
      if (!handleGlobalApiError(err)) {
        toast.error("Gagal menghapus aset", { description: err.message || "Unknown error" });
      }
    }
  };

  const assignGoal = async (assetId: string, goalId: string | undefined) => {
    try {
      await AssetApi.update(assetId, { goalId }, products);
      await usePortfolioStore.getState().fetchPortfolio();
      await useGoalsStore.getState().fetchGoals();
      await useGoalsStore.getState().fetchProjections();
      toast.success("Tujuan investasi berhasil dihubungkan");
    } catch (err: any) {
      if (!handleGlobalApiError(err)) {
        toast.error("Gagal menghubungkan tujuan investasi", { description: err.message || "Unknown error" });
      }
    }
  };

  const handleSelectAsset = async (id: string) => {
    setDetailAssetId(id);
    const asset = myAssets.find((a) => a.id === id);
    if (!asset) return;

    setLoadingProduct(true);
    try {
      const res = await ProductApi.getById(asset.productId);
      setSelectedProduct(res.data);
    } catch (err: any) {
      if (!handleGlobalApiError(err)) {
        toast.error("Gagal memuat detail produk", { description: err.message || "Unknown error" });
      }
      setDetailAssetId(null);
    } finally {
      setLoadingProduct(false);
    }
  };

  const detailAsset = detailAssetId ? myAssets.find((a) => a.id === detailAssetId) : null;

  if (loadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground mt-4">Loading product details...</p>
      </div>
    );
  }

  if (detailAsset && selectedProduct) {
    return (
      <AssetDetailPage
        asset={detailAsset}
        product={selectedProduct}
        goals={goals}
        onSave={updateAsset}
        onDelete={removeAsset}
        onBack={() => {
          setDetailAssetId(null);
          setSelectedProduct(null);
        }}
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
                {["Product", "Qty", "Platform", "Date", "Cost Basis", "Cur Value", "P/L", "Goals", ""].map(
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
                  goals={goals}
                  onSelect={handleSelectAsset}
                  onRemove={removeAsset}
                  onAssignGoal={assignGoal}
                />
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--muted)", borderTop: "2px solid var(--border)" }}>
                <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-foreground">
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
