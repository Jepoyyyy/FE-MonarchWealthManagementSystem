import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, ToggleRight, ToggleLeft } from "lucide-react";
import type { AppUser, Product, Asset, ProductType, AuditLog } from "~/types";
import { PageHeader } from '~/shared/components/PageHeader';
import { fmt } from "~/utils";
import { TrackModal } from "./TrackModal";
import { ProductCard } from '~/features/products/components/ProductCard';
import { Pagination } from '~/shared/components/Pagination';
import { RiskProfileBanner } from '~/features/profile/components/RiskProfileBanner';
import { useProductsStore } from '~/features/products/products.store';
import { AssetApi } from '~/features/assets/api';
import { useDebounce } from '~/shared/hooks/useDebounce';

interface ProductsViewProps {
  user: AppUser;
  addLog: (l: Omit<AuditLog, "id">) => void;
  toast: any;
}

const PAGE_SIZE = 20;

export function ProductsView({ user, addLog, toast }: ProductsViewProps) {
  const [showHighRisk, setShowHighRisk] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);

  const search = useDebounce(searchInput, 300);

  const {
    products,
    loading,
    error,
    totalPages,
    fetchProducts,
  } = useProductsStore();

  // reset to first page whenever a filter changes
  useEffect(() => {
    setPage(0);
  }, [search, typeFilter, showHighRisk]);

  // fetch whenever filters or page change
  useEffect(() => {
    fetchProducts({
      searchQuery: search || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      showAll: showHighRisk,
      page,
      size: PAGE_SIZE,
    });
  }, [search, typeFilter, showHighRisk, page, fetchProducts]);

  const saveTracked = async (data: Omit<Asset, "id">) => {
    const p = products.find((pr) => pr.id === data.productId);
    if (!p) {
      toast.error("Product not found. Please refresh and try again.");
      return;
    }
    try {
      await AssetApi.create(data);
      try {
        addLog({
          userId: user.id,
          userName: user.name,
          action: "ADD_ASSET",
          details: `Tracked ${p.name} — ${fmt(data.amount)} (from products view)`,
          timestamp: new Date().toISOString(),
          category: "portfolio",
        });
      } catch (logErr) {
        console.error("Failed to add audit log:", logErr);
      }
      setTrackingProduct(null);
      toast.success("Investment tracked", {
        description: `${p.name} added to your portfolio.`,
      });
    } catch (err: any) {
      console.error("Failed to track investment:", err);
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
        />
      )}

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or issuer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
              <option value="Mutual Fund">Mutual Funds</option>
              <option value="Stock">Stocks</option>
              <option value="Bond">Bonds (SBN)</option>
              <option value="Deposit">Deposits</option>
              <option value="Money Market">Money Market</option>
              <option value="Balanced Fund">Balanced Fund</option>
              <option value="Sukuk">Sukuk</option>
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

      <RiskProfileBanner user={user} showHighRisk={showHighRisk} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load products</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
          Loading products...
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center">
              <Search size={32} className="text-muted-foreground mb-3" />
              <p className="font-semibold text-lg text-foreground">No products match</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onTrack={() => setTrackingProduct(p)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="pt-4"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}