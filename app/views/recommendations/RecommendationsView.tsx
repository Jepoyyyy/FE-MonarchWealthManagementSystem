import { useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import type { AppUser, Asset, Product, Goal, FinancialProfile, AuditLog } from "~/types";
import { riskLabel, fmt, fmtFull, fmtPct } from "~/utils";
import { calcHealthScore, generateRecommendations } from "~/engine";
import { PageHeader } from "~/components/ui/PageHeader";
import { ScoreRing } from "~/components/ui/ScoreRing";
import { SubScore } from "~/components/ui/SubScore";
import { RecommendationCard } from "~/components/ui/RecommendationCard";
import { TrackModal } from "~/views/products/TrackModal";
import { useRecommendationsStore } from "~/stores/recommendationsStore";
import { useEffect } from "react";
import { AssetApi } from "~/api/assets";

interface RecommendationsViewProps {
  user: AppUser;
  assets: Asset[];
  products: Product[];
  goals: Goal[];
  finProfile: FinancialProfile;
  addLog: (l: Omit<AuditLog, "id">) => void;
  toast: any;
}

export function RecommendationsView({
  user,
  assets,
  products,
  goals,
  finProfile,
  addLog,
  toast,
}: RecommendationsViewProps) {
  const myAssets = assets.filter((a) => a.userId === user.id);
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null);

  const { recommendations, loading, fetchRecommendations } = useRecommendationsStore();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const score = useMemo(
    () => calcHealthScore(user, myAssets, products, goals, finProfile),
    [user, myAssets, products, goals, finProfile]
  );
  const recs = recommendations;

  const scoreColor = score.total >= 70 ? "#10b981" : score.total >= 45 ? "#f59e0b" : "#ef4444";

  const saveTracked = async (data: Omit<Asset, "id">) => {
    const p = products.find((pr) => pr.id === data.productId)!;
    try {
      await AssetApi.create(data as any);
      addLog({
        userId: user.id,
        userName: user.name,
        action: "ADD_ASSET",
        details: `Tracked ${p.name} — ${fmtFull(data.amount)} (from recommendation)`,
        timestamp: new Date().toISOString(),
        category: "portfolio",
      });
      toast.success("Rekomendasi ditindaklanjuti", { description: `${p.name} — ${fmtFull(data.amount)}` });
      setTrackingProduct(null);
    } catch (err: any) {
      toast.error("Gagal menyimpan aset", { description: err.message });
    }
  };

  const highCount = recs.filter((r) => r.priority === "high").length;



  return (
    <div className="space-y-6">
      {trackingProduct && (
        <TrackModal
          user={user}
          products={products}
          initialProduct={trackingProduct}
          onSave={saveTracked}
          onClose={() => setTrackingProduct(null)}
        />
      )}

      <PageHeader
        title="Recommendations"
        subtitle={`Personalised for your ${riskLabel(user.riskProfile)} profile · ${recs.length} suggestions`}
      />

      {/* Score ring & breakdown */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <ScoreRing score={score.total} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Portfolio Health
            </p>
            <p
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-serif)", color: scoreColor }}
            >
              {score.total >= 70 ? "Healthy" : score.total >= 45 ? "Needs attention" : "Action required"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {highCount > 0
                ? `${highCount} high-priority issue${highCount > 1 ? "s" : ""} to address`
                : "No critical issues — focus on growth opportunities"}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 md:p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <SubScore
              label="Emergency Fund"
              score={score.emergency}
              color={score.emergency >= 18 ? "#10b981" : score.emergency >= 10 ? "#f59e0b" : "#ef4444"}
            />
            <SubScore
              label="Diversification"
              score={score.diversification}
              color={score.diversification >= 18 ? "#10b981" : score.diversification >= 10 ? "#f59e0b" : "#ef4444"}
            />
            <SubScore
              label="Goal Coverage"
              score={score.goalCoverage}
              color={score.goalCoverage >= 18 ? "#10b981" : score.goalCoverage >= 10 ? "#f59e0b" : "#ef4444"}
            />
            <SubScore
              label="Risk Alignment"
              score={score.riskAlignment}
              color={score.riskAlignment >= 18 ? "#10b981" : score.riskAlignment >= 10 ? "#f59e0b" : "#ef4444"}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Risk profile</p>
              <p className="font-semibold mt-0.5 text-foreground">{riskLabel(user.riskProfile)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Portfolio value</p>
              <p
                className="font-semibold mt-0.5 text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fmt(myAssets.reduce((s, a) => s + a.currentValue, 0))}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly surplus</p>
              <p
                className="font-semibold mt-0.5 text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fmt(
                  Math.max(
                    finProfile.monthlyIncome - (Object.values(finProfile.expenses) as number[]).reduce((a, b) => a + b, 0),
                    0
                  )
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rec list */}
      {loading && recs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center animate-pulse text-muted-foreground">
          Analyzing portfolio...
        </div>
      ) : recs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle size={40} className="text-emerald-500 mb-3" />
          <p className="font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
            Your portfolio looks great
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            No specific recommendations right now. Keep investing consistently.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onTrack={setTrackingProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
