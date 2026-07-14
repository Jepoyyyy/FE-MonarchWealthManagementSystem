import type { ProductType } from "~/types";
import { Badge } from "./Badge";

interface ProductTypeBadgeProps {
  type: ProductType;
  className?: string;
}

const typeLabels: Record<ProductType, string> = {
  money_market: "Money Market",
  deposit: "Deposit",
  bond: "Bond",
  mutual_fund: "Mutual Fund",
  stock: "Stock",
};

const typeIcons: Record<ProductType, string> = {
  money_market: "💰",
  deposit: "🏦",
  bond: "📜",
  mutual_fund: "📈",
  stock: "📊",
};

export function ProductTypeBadge({ type, className = "" }: ProductTypeBadgeProps) {
  const icon = typeIcons[type] ?? "🪙";
  const label = typeLabels[type] ?? type;

  return (
    <Badge variant="secondary" className={`inline-flex items-center gap-1 ${className}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Badge>
  );
}
