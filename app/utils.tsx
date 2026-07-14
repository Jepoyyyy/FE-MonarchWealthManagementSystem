import type { RiskProfile, ProductType, AuditLog, UserStatus } from "~/types";

export const fmt = (n: number) => {
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `IDR ${(n / 1e3).toFixed(0)}K`;
  return `IDR ${n.toLocaleString()}`;
};

export const fmtFull = (n: number) => `IDR ${n.toLocaleString("id-ID")}`;

export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const fmtTs = (s: string) =>
  new Date(s).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const riskLabel = (p: RiskProfile | null) =>
  ({ risk_averse: "Risk Averse", moderate: "Moderate", risk_taker: "Risk Taker" }[p!] ?? "Not Set");


export const typeLabel = (t: ProductType) =>
  ({ money_market: "Money Market", deposit: "Deposit", bond: "Bond", mutual_fund: "Mutual Fund", stock: "Stock" }[t]);


export const maxRiskForProfile = (p: RiskProfile | null, showHigh: boolean): number => {
  const base = { risk_averse: 2, moderate: 3, risk_taker: 5 }[p!] ?? 2;
  return showHigh && p !== "risk_taker" ? Math.min(base + 1, 5) : base;
};

export const scoreToProfile = (s: number): RiskProfile =>
  s <= 3 ? "risk_averse" : s <= 7 ? "moderate" : "risk_taker";

export const genHistory = (total: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  let v = total * 0.76;
  return months.map((m, i) => {
    if (i === months.length - 1) return { month: m, value: total, baseline: total * 0.76 };
    v = Math.round(v * (1 + 0.012 + Math.random() * 0.025));
    return { month: m, value: v, baseline: total * 0.76 };
  });
};

export const categoryBadge = (c: AuditLog["category"]) =>
  ({
    auth: "bg-blue-100 text-blue-700 border-blue-200",
    portfolio: "bg-emerald-100 text-emerald-700 border-emerald-200",
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    questionnaire: "bg-amber-100 text-amber-700 border-amber-200",
  }[c]);

export const statusBadge = (s: UserStatus) =>
  ({
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    suspended: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  }[s]);

// Goal utilities
export const monthsToGoal = (
  target: number,
  current: number,
  monthly: number,
  annualReturn: number
): number => {
  if (current >= target) return 0;
  if (monthly <= 0) return -1;
  const r = annualReturn / 100 / 12;
  if (r === 0) {
    const m = Math.ceil((target - current) / monthly);
    return m > 1200 ? -1 : m;
  }
  let v = current;
  let n = 0;
  while (v < target && n < 1200) {
    v = v * (1 + r) + monthly;
    n++;
  }
  return n >= 1200 ? -1 : n;
};

export const fmtDuration = (months: number): string => {
  if (months === 0) return "Reached!";
  if (months < 0) return "100+ years";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}yr`;
  return `${y}yr ${m}mo`;
};

export const projectedDate = (months: number): string => {
  if (months <= 0 || months > 1200) return "—";
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

// Monthly contribution needed to reach a target in exactly `months` months
export const monthlyNeeded = (
  target: number,
  current: number,
  months: number,
  annualReturn: number
): number => {
  if (months <= 0) return 0;
  const r = annualReturn / 100 / 12;
  if (r === 0) return Math.max(0, Math.round((target - current) / months));
  const g = Math.pow(1 + r, months);
  const pmt = ((target - current * g) * r) / (g - 1);
  return Math.max(0, Math.round(pmt));
};
