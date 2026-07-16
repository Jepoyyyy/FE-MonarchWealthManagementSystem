import { Shield, SlidersHorizontal, Target, Layers, TrendingUp, DollarSign, Plus } from "lucide-react";
import type { Product, Recommendation } from "~/types";
import { Badge } from '~/shared/components/Badge';
import { Btn } from '~/shared/components/Button';
import { ProductTypeBadge } from '~/features/products/components/ProductTypeBadge';
import { RiskLevelBadge } from '~/features/profile/components/RiskLevelBadge';
import { FormattedAmount } from '~/shared/components/FormattedAmount';
import { PRIORITY_CONFIG } from '~/features/recommendations/recommendations.config';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onTrack: (p: Product) => void;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  emergency: <Shield size={16} />,
  rebalance: <SlidersHorizontal size={16} />,
  goal: <Target size={16} />,
  diversification: <Layers size={16} />,
  growth: <TrendingUp size={16} />,
  surplus: <DollarSign size={16} />,
};

export function RecommendationCard({ recommendation, onTrack }: RecommendationCardProps) {
  const pc = PRIORITY_CONFIG[recommendation.priority];
  const icon = CATEGORY_ICON[recommendation.category];

  return (
    <div className="bg-card rounded-xl border overflow-hidden flex border-border">
      <div className="w-1 flex-shrink-0" style={{ background: pc.color }} />

      <div className="flex-1 p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className="text-xs"
                style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}
              >
                {pc.label}
              </Badge>
              <Badge variant="outline">{recommendation.category.replace(/_/g, " ")}</Badge>
              {recommendation.goal && (
                <Badge variant="good">
                  🎯 {recommendation.goal.name}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold mb-1.5 text-foreground">{recommendation.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{recommendation.reason}</p>

            {recommendation.product && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                <ProductTypeBadge type={recommendation.product.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {recommendation.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recommendation.product.issuer}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-bold text-accent"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {recommendation.product.annualReturn}%
                  </p>
                  <p className="text-xs text-muted-foreground">p.a.</p>
                </div>
                <RiskLevelBadge level={recommendation.product.riskLevel} />
                {recommendation.suggestedAmount && (
                  <div className="text-right flex-shrink-0 pl-2 border-l border-border">
                    <FormattedAmount
                      value={recommendation.suggestedAmount}
                      className="text-xs font-semibold text-foreground block"
                    />
                    <p className="text-xs text-muted-foreground">suggested</p>
                  </div>
                )}
                <Btn size="sm" onClick={() => onTrack(recommendation.product!)}>
                  <Plus size={12} /> Track
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
