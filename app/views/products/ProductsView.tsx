import { useState, useMemo, useEffect } from "react";
import { Search, Filter, AlertTriangle, ToggleRight, ToggleLeft, Plus, Clock } from "lucide-react";
import type { AppUser, Product, Asset, ProductType } from "~/types";
import { PageHeader } from "~/components/ui/PageHeader";
import { maxRiskForProfile, riskLabel, fmt } from "~/utils";
import { TrackModal } from "./TrackModal";
import { ProductCard } from "~/components/ui/ProductCard";
import { useProductsStore } from "~/stores/productsStore";
import { AssetApi } from "~/api/assets";

interface ProductsViewProps {
  user: AppUser;
  addLog: (l: any) => void;
  toast: any;
}

export function ProductsView({
  user,
  addLog,
  toast,
}: ProductsViewProps) {
  const [showHighRisk, setShowHighRisk] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const { products, loading, fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const maxRisk = maxRiskForProfile(user.riskProfile, showHighRisk);

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (!p.visible) return false;
      if (p.riskLevel > maxRisk) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.issuer.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [products, maxRisk, typeFilter, search]);

  const saveTracked = async (data: Omit<Asset, "id">) => {
    const p = products.find((pr) => pr.id === data.productId)!;
    try {
      await AssetApi.create(data as any);
      addLog({
        userId: user.id,
        userName: user.name,
        action: "ADD_ASSET",
        details: `Tracked ${p.name} — ${fmt(data.amount)} (from products view)`,
        timestamp: new Date().toISOString(),
        category: "portfolio",
      });
      setTrackingProduct(null);
      toast.success("Investment tracked", {
        description: `${p.name} added to your portfolio.`,
      });
    } catch (err: any) {
      toast.error("Failed to track investment", { description: err.message });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Explore Products"
        subtitle="Discover investment products tailored to your risk profile"
      />

      {trackingProduct && (
        <TrackModal
          user={user}
          products={products}
          initialProduct={trackingProduct}
          onSave={saveTracked}
          onClose={() => setTrackingProduct(null)}
          investableSurplus={0}
        />
      )}

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or issuer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-sm rounded-lg border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            >
              <option value="all">All Types</option>
              <option value="mutual_fund">Mutual Funds</option>
              <option value="stock">Stocks</option>
              <option value="bond">Bonds (SBN)</option>
              <option value="deposit">Deposits</option>
            </select>
          </div>

          <div className="h-6 w-px bg-border hidden md:block"></div>

          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setShowHighRisk(!showHighRisk)}
          >
            {showHighRisk ? (
              <ToggleRight size={28} className="text-red-500 transition-colors" />
            ) : (
              <ToggleLeft size={28} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <span className="text-sm font-medium text-foreground">
              Show High Risk
            </span>
          </div>
        </div>
      </div>

      {!showHighRisk && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Filtered for your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing investments suitable for a {riskLabel(user.riskProfile)} investor (Risk Level ≤ {maxRiskForProfile(user.riskProfile, false)}). Enable "Show High Risk" to see all.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
          Loading products...
        </div>
      ) : (
        <>
          {visible.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center">
              <Search size={32} className="text-muted-foreground mb-3" />
              <p className="font-semibold text-lg text-foreground">No products match</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onTrack={() => setTrackingProduct(p)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}