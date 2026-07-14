import { Clock, Plus } from "lucide-react";
import type { Product } from "~/types";
import { ProductTypeBadge } from "./ProductTypeBadge";
import { RiskLevelBadge } from "./RiskLevelBadge";
import { FormattedAmount } from "./FormattedAmount";
import { Btn } from "./Btn";

interface ProductCardProps {
  product: Product;
  onTrack: (p: Product) => void;
}

export function ProductCard({ product, onTrack }: ProductCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <ProductTypeBadge type={product.type} />
        <RiskLevelBadge level={product.riskLevel} />
      </div>
      <h4 className="font-semibold text-sm leading-tight mb-1 text-foreground">
        {product.name}
      </h4>
      <p className="text-xs text-muted-foreground mb-3">{product.issuer}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{product.description}</p>
      {product.tenor && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
          <Clock size={12} /> Tenor: {product.tenor}
        </div>
      )}
      <div className="flex items-end justify-between pt-3 border-t border-border">
        <div>
          <p
            className="text-xl font-bold text-accent"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {product.annualReturn}%
          </p>
          <p className="text-xs text-muted-foreground">annual return</p>
        </div>
        <div className="text-right">
          <FormattedAmount
            value={product.minInvestment}
            className="text-xs font-medium text-foreground block"
          />
          <p className="text-xs text-muted-foreground">min. investment</p>
        </div>
      </div>
      <Btn
        variant="unstyled"
        onClick={() => onTrack(product)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all hover:opacity-90 cursor-pointer"
        style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "transparent" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--primary)";
        }}
      >
        <Plus size={12} /> Track in Portfolio
      </Btn>
    </div>
  );
}
