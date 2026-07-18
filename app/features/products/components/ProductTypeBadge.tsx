import type { ProductType } from "~/types";
import { typeLabel } from "~/utils";
import { Badge } from '~/shared/components/Badge';

interface ProductTypeBadgeProps {
  type: ProductType;
  className?: string;
}

const typeIcons: Record<ProductType, string> = {
  "Money Market": "💰",
  Deposit: "🏦",
  Bond: "📜",
  "Mutual Fund": "📈",
  Stock: "📊",
  "Balanced Fund": "⚖️",
  Sukuk: "🕌",
};

export function ProductTypeBadge({ type, className = "" }: ProductTypeBadgeProps) {
  const icon = typeIcons[type] ?? "🪙";
  const label = typeLabel(type) ?? type;

  return (
    <Badge variant="secondary" className={`inline-flex items-center gap-1 ${className}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Badge>
  );
}
