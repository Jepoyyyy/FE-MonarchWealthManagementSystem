import { AlertTriangle } from "lucide-react";
import type { AppUser } from "~/types";
import { riskLabel, maxRiskForProfile } from "~/utils";

interface RiskProfileBannerProps {
  user: AppUser;
  showHighRisk: boolean;
}

export function RiskProfileBanner({ user, showHighRisk }: RiskProfileBannerProps) {
  if (!user.riskProfile) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">Risk profile not set</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Products are filtered conservatively. Complete your risk questionnaire to see personalized recommendations, or toggle "Show High Risk" to see all products.
          </p>
        </div>
      </div>
    );
  }

  if (showHighRisk) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
      <AlertTriangle size={16} className="text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Filtered for your profile</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Showing investments suitable for a {riskLabel(user.riskProfile)} investor (Risk Level ≤ {maxRiskForProfile(user.riskProfile, false)}). Enable "Show High Risk" to see all.
        </p>
      </div>
    </div>
  );
}
