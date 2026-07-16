import type { RiskProfile } from "../types/common";

export const riskLabel = (p: RiskProfile | null) =>
  ({ risk_averse: "Risk Averse", moderate: "Moderate", risk_taker: "Risk Taker" }[p!] ?? "Not Set");

export const maxRiskForProfile = (p: RiskProfile | null, showHigh: boolean): number => {
  const base = { risk_averse: 2, moderate: 3, risk_taker: 5 }[p!] ?? 2;
  return showHigh ? 5 : base;
};

export const scoreToProfile = (s: number): RiskProfile =>
  s <= 3 ? "risk_averse" : s <= 7 ? "moderate" : "risk_taker";
