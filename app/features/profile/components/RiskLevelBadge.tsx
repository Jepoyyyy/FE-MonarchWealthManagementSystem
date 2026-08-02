import { Badge } from '~/shared/components/Badge';

interface RiskLevelBadgeProps {
  level: number;
  className?: string;
}

const levelBadgeClasses: Record<number, string> = {
  1: "bg-green-100 text-green-700 border-green-200",
  2: "bg-green-100 text-green-700 border-green-200",
  3: "bg-orange-100 text-orange-700 border-orange-200",
  4: "bg-red-100 text-red-700 border-red-200",
  5: "bg-red-100 text-red-700 border-red-200",
};

const levelLabels: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

export function RiskLevelBadge({ level, className = "" }: RiskLevelBadgeProps) {
  const badgeClass = levelBadgeClasses[level] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const label = levelLabels[level] ?? "Unknown";

  return (
    <Badge className={`${badgeClass} ${className}`}>
      {label}
    </Badge>
  );
}
