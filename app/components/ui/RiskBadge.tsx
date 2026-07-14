import type { RiskProfile } from "~/types";
import { Badge } from "./Badge";

interface RiskBadgeProps {
  profile: RiskProfile | null;
  showDot?: boolean;
  className?: string;
}

const riskBadgeClasses: Record<string, string> = {
  risk_averse: "bg-emerald-100 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  risk_taker: "bg-red-100 text-red-700 border-red-200",
};

const riskLabels: Record<string, string> = {
  risk_averse: "Risk Averse",
  moderate: "Moderate",
  risk_taker: "Risk Taker",
};

const riskDotClasses: Record<string, string> = {
  risk_averse: "bg-emerald-500",
  moderate: "bg-amber-500",
  risk_taker: "bg-red-500",
};

export function RiskBadge({ profile, showDot = false, className = "" }: RiskBadgeProps) {
  const p = profile ?? "not_set";
  const badgeClass = riskBadgeClasses[p] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = riskLabels[p] ?? "Not Set";
  const dotClass = riskDotClasses[p] ?? "bg-gray-400";

  return (
    <Badge variant="outline" className={`${badgeClass} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full mr-1 ${dotClass}`} />}
      {label}
    </Badge>
  );
}
