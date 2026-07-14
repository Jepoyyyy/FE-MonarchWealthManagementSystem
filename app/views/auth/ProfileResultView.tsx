import { Shield, ChevronRight, Star } from "lucide-react";
import type { RiskProfile } from "~/types";
import { Btn } from "~/components/ui/Btn";

interface ProfileResultProps {
  profile: RiskProfile;
  score: number;
  onContinue: () => void;
}

export function ProfileResultView({ profile, score, onContinue }: ProfileResultProps) {
  const config = {
    risk_averse: {
      label: "Risk Averse",
      color: "#10b981",
      bg: "#f0fdf4",
      desc: "You prefer capital preservation. We'll recommend Money Market and Deposit products.",
      products: "Money Market & Deposits",
    },
    moderate: {
      label: "Moderate",
      color: "#f59e0b",
      bg: "#fffbeb",
      desc: "You seek balanced growth. We'll feature Mutual Funds and Bonds for you.",
      products: "Mutual Funds & Bonds",
    },
    risk_taker: {
      label: "Risk Taker",
      color: "#ef4444",
      bg: "#fef2f2",
      desc: "You chase maximum returns. Stocks and high-yield instruments await you.",
      products: "Stocks & High-Yield Funds",
    },
  }[profile];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)" }}
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-center border border-border">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: config.bg, border: `3px solid ${config.color}` }}
        >
          <Shield size={32} style={{ color: config.color }} />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
          Your Risk Profile
        </p>
        <h2
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-serif)", color: config.color }}
        >
          {config.label}
        </h2>
        <p className="text-muted-foreground text-sm mb-1">Score: {score} / 10</p>
        <div className="w-full bg-muted rounded-full h-2 my-4">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(score / 10) * 100}%`, background: config.color }}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{config.desc}</p>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: config.bg, color: config.color }}
        >
          <Star size={12} /> Recommended: {config.products}
        </div>
        <Btn onClick={onContinue} className="w-full" size="lg">
          Go to Dashboard <ChevronRight size={16} />
        </Btn>
      </div>
    </div>
  );
}
