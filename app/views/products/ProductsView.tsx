import { useState, useMemo } from "react";
import { Search, Filter, AlertTriangle, ToggleRight, ToggleLeft, Plus, Clock } from "lucide-react";
import type { AppUser, Product, Asset, ProductType } from "~/types";
import { PageHeader } from "~/components/ui/PageHeader";
import { Btn } from "~/components/ui/Btn";
import { Badge } from "~/components/ui/Badge";
import { maxRiskForProfile, riskLabel, typeLabel, fmt } from "~/utils";
import { TrackModal } from "./TrackModal";
import { ProductCard } from "~/components/ui/ProductCard";

interface ProductsViewProps {
  user: AppUser;
  products: Product[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  addLog: (l: any) => void;
  toast: any;
}

export function ProductsView({
  user,
  products,
  setAssets,
  addLog,
  toast,
}: ProductsViewProps) {
  const [showHighRisk, setShowHighRisk] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

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
      )
        return false;
      return true;
    });
  }, [products, maxRisk, typeFilter, search]);

  const types: Array<{ id: ProductType | "all"; label: string }> = [
    { id: "all", label: "All Types" },
    { id: "money_market", label: "Money Market" },
    { id: "deposit", label: "Deposit" },
    { id: "bond", label: "Bond" },
    { id: "mutual_fund", label: "Mutual Fund" },
    { id: "stock", label: "Stock" },
  ];

  const saveFromProducts = (data: Omit<Asset, "id">) => {
    const p = products.find((pr) => pr.id === data.productId)!;
    setAssets((prev) => [...prev, { ...data, id: `a${Date.now()}` }]);
    addLog({
      userId: user.id,
      userName: user.name,
      action: "ADD_ASSET",
      details: `Tracked ${p.name} — ${fmt(data.amount)} via ${data.platform || "external platform"}`,
      timestamp: new Date().toISOString(),
      category: "portfolio",
    });
    toast.success("Produk berhasil dilacak", { description: `${p.name} — ${fmt(data.amount)}` });
    setTrackingProduct(null);
  };

  return (
    <div className="space-y-6">
      {trackingProduct && (
        <TrackModal
          user={user}
          products={products}
          initialProduct={trackingProduct}
          onSave={saveFromProducts}
          onClose={() => setTrackingProduct(null)}
        />
      )}
      <PageHeader title="Investment Products" subtitle="Browse products matched to your risk profile" />

      {/* Risk toggle banner */}
      {user.riskProfile !== "risk_taker" && (
        <div
          className="p-4 rounded-xl flex items-center justify-between gap-4 border"
          style={{
            background: showHighRisk ? "rgba(239,68,68,0.08)" : "var(--card)",
            borderColor: showHighRisk ? "rgba(239,68,68,0.25)" : "var(--border)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className={showHighRisk ? "text-red-500 mt-0.5" : "text-muted-foreground mt-0.5"}
            />
            <div>
              <p className="text-sm font-medium text-foreground">Show higher-risk options</p>
              <p className="text-xs text-muted-foreground">
                View products one risk level above your {riskLabel(user.riskProfile)} profile. Proceed
                with caution.
              </p>
            </div>
          </div>
          <Btn variant="unstyled" onClick={() => setShowHighRisk((s) => !s)} className="flex-shrink-0">
            {showHighRisk ? (
              <ToggleRight size={32} style={{ color: "var(--destructive)" }} />
            ) : (
              <ToggleLeft size={32} className="text-muted-foreground" />
            )}
          </Btn>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or issuer…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <Btn
              variant="unstyled"
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className="cursor-pointer"
            >
              <Badge
                variant={typeFilter === t.id ? "default" : "secondary"}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === t.id ? "" : "hover:border-primary/30"
                }`}
              >
                {t.label}
              </Badge>
            </Btn>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter size={32} className="text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No products match your filters</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onTrack={setTrackingProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
