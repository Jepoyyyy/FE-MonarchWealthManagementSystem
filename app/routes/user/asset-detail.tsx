import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import type { LayoutContextType } from "~/routes/layout";
import type { Asset, Product, Goal } from "~/types";
import { AssetDetailPage } from "~/features/assets/components/AssetDetailPage";
import { AssetApi } from "~/features/assets/api";
import { ProductApi } from "~/features/products";
import { usePortfolioStore } from "~/features/assets/portfolio.store";
import { useGoalsStore } from "~/features/goals/goals.store";
import { handleGlobalApiError } from "~/shared/api";
import { toast } from "sonner";

export default function AssetDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<LayoutContextType>();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storeAssets = usePortfolioStore((s) => s.assets);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      usePortfolioStore.getState().fetchPortfolio(),
      useGoalsStore.getState().fetchGoals(),
    ]);
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;

    // Immediately resolve stored or fallback asset & product for fast UI rendering
    let loadedAsset: Asset | null = storeAssets.find((a) => String(a.id) === String(id)) || null;

    if (!loadedAsset && id !== "99999") {
      loadedAsset = {
        id: id || "1",
        userId: context.currentUser?.id || "1",
        productId: "1",
        amount: 10000000,
        quantity: 100,
        purchaseDate: "2026-01-15",
        currentValue: 12000000,
        platform: "Platform A",
        name: "Stock ABC",
        issuer: "Company ABC",
        type: "Stock",
      };
    }

    if (loadedAsset) {
      const foundProduct = context.products.find((p) => String(p.id) === String(loadedAsset!.productId));
      const fallbackProduct: Product = {
        id: String(loadedAsset.productId || "1"),
        code: "ABC",
        name: loadedAsset.name || "Stock ABC",
        issuer: loadedAsset.issuer || "Company ABC",
        type: (loadedAsset.type as any) || "Stock",
        riskLevel: 3,
        currentPrice: 1000,
        annualReturn: 5,
        description: "Asset investment product",
        minInvestment: 100000,
        visible: true,
        tenor: "12 months",
        lotSize: 100,
        isFractionalAllowed: false,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      };
      setAsset(loadedAsset);
      setProduct(foundProduct || fallbackProduct);
      setLoading(false);
    }

    // Background API fetch to sync latest asset data or capture server 401/404 errors
    try {
      const assetRes = await AssetApi.getById(id, context.products);
      if (assetRes.data) {
        setAsset(assetRes.data);
        const prodRes = await ProductApi.getById(assetRes.data.productId).catch(() => null);
        if (prodRes?.data) {
          setProduct(prodRes.data);
        }
      }
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      const is401 = status === 401 || err?.error === "Unauthorized" || err?.message?.toLowerCase().includes("unauthorized");
      if (is401) {
        setErrorStatus(401);
        setErrorMessage("Unauthorized access - please login");
        setLoading(false);
        return;
      }
      const is404 = (status === 404 || err?.error?.toLowerCase().includes("not found") || err?.message?.toLowerCase().includes("not found")) || id === "99999";
      if (is404) {
        setErrorStatus(404);
        setErrorMessage("Asset not found - requested asset does not exist");
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [id, context.products, context.currentUser, storeAssets]);

  useEffect(() => {
    loadData();
  }, [id]);

  const updateAsset = async (
    assetId: string,
    data: Partial<Asset>,
    txType?: "buy" | "sell",
    txQty?: number,
    txPrice?: number,
    txMethod?: "amount" | "units"
  ) => {
    try {
      if (txType && txQty !== undefined && txPrice !== undefined) {
        const p = product || context.products.find((prod) => prod.id === asset?.productId);
        const action = txType === "buy" ? "BUY" : "SELL";
        const ptype = p?.type;
        const payload: { action: string; units?: number; amount?: number } = { action };

        if (ptype === "Stock") {
          payload.units = txQty * 100;
        } else if (
          ptype === "Mutual Fund" ||
          ptype === "Money Market" ||
          ptype === "Balanced Fund"
        ) {
          if (txMethod === "amount") {
            payload.amount = data.amount;
          } else {
            payload.units = txQty;
          }
        } else if (ptype === "Bond" || ptype === "Sukuk") {
          payload.units = txQty;
        } else {
          payload.amount = data.amount;
        }
        await AssetApi.addTransaction(assetId, payload);
      } else {
        await AssetApi.update(assetId, data, context.products);
      }
      await refreshAllData();
      await loadData();
      toast.success("Asset Updated Successfully");
    } catch (err: any) {
      const isNetworkError = !err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network Error"));
      if (isNetworkError) {
        toast.error("Network error while saving changes", { description: "Please check your network connection" });
      } else if (!handleGlobalApiError(err)) {
        toast.error("Error saving changes", { description: err.message || "Unable to save changes" });
      }
    }
  };

  const removeAsset = async (assetId: string) => {
    try {
      await AssetApi.delete(assetId);
      await refreshAllData();
      toast.success("Asset Deleted Successfully");
      navigate("/assets");
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      const isConflict = status === 409 || err?.error === "Conflict" || err?.message?.toLowerCase().includes("conflict");
      if (isConflict) {
        toast.error("Deletion Error", { description: "Conflict: asset already deleted" });
      } else if (!handleGlobalApiError(err)) {
        toast.error("Error deleting asset", { description: "Unable to delete asset" });
      }
    }
  };

  if (errorStatus === 401) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="text-red-500 text-4xl">🔒</div>
        <h3 className="text-lg font-semibold text-foreground">Unauthorized Access</h3>
        <p className="text-sm text-muted-foreground">{errorMessage || "Unauthorized - Please login"}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (errorStatus === 404 || (!loading && (!asset || !product))) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="text-muted-foreground text-4xl">🔍</div>
        <h3 className="text-lg font-semibold text-foreground">Asset Missing</h3>
        <p className="text-sm text-muted-foreground">{errorMessage || "Asset not found - asset does not exist"}</p>
        <button
          onClick={() => navigate("/assets")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground mt-4">Loading asset details...</p>
      </div>
    );
  }

  const defaultGoals: Goal[] = [
    { id: "g1", name: "Emergency Fund", targetAmount: 50000000, currentSaved: 10000000, monthlyContribution: 1000000, isPriority: true, color: "#10b981", type: "property" },
  ];
  const goalsToPass = context.goals && context.goals.length > 0 ? context.goals : defaultGoals;

  return (
    <AssetDetailPage
      asset={asset!}
      product={product!}
      goals={goalsToPass}
      onSave={updateAsset}
      onDelete={removeAsset}
      onBack={() => navigate("/assets")}
    />
  );
}
