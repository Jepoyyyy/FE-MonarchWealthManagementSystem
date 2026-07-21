import type { RiskProfile, ProductType, AuditLog, UserStatus } from "~/types";

export const fmt = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return 'IDR 0';
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `IDR ${(n / 1e3).toFixed(0)}K`;
  return `IDR ${n.toLocaleString()}`;
};

export const fmtFull = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return 'IDR 0';
  return `IDR ${n.toLocaleString("id-ID")}`;
};

export const fmtPct = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return '0.00%';
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

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
  ({
    "Money Market": "Money Market",
    "Bank Deposit": "Bank Deposit",
    "Bond": "Bond",
    "Mutual Fund": "Mutual Fund",
    "Stock": "Stock",
    "Balanced Fund": "Balanced Fund",
    "Sukuk": "Sukuk",
  }[t]);


export const maxRiskForProfile = (p: RiskProfile | null, showHigh: boolean): number => {
  const base = { risk_averse: 2, moderate: 3, risk_taker: 5 }[p!] ?? 2;
  return showHigh ? 5 : base;
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

export const categoryBadge = (c: string) =>
  ({
    auth:           "bg-blue-100 text-blue-700 border-blue-200",
    AUTH:           "bg-blue-100 text-blue-700 border-blue-200",
    portfolio:      "bg-emerald-100 text-emerald-700 border-emerald-200",
    GOAL:           "bg-emerald-100 text-emerald-700 border-emerald-200",
    ASSET:          "bg-emerald-100 text-emerald-700 border-emerald-200",
    admin:          "bg-purple-100 text-purple-700 border-purple-200",
    PRODUCT:        "bg-purple-100 text-purple-700 border-purple-200",
    USER:           "bg-purple-100 text-purple-700 border-purple-200",
    questionnaire:  "bg-amber-100 text-amber-700 border-amber-200",
    RISK_PROFILE:   "bg-amber-100 text-amber-700 border-amber-200",
    FINANCES:       "bg-orange-100 text-orange-700 border-orange-200",
  } as Record<string, string>)[c] ?? "bg-gray-100 text-gray-600 border-gray-200";

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
): number => {
  if (current >= target) return 0;
  if (monthly <= 0) return -1;
  const m = Math.ceil((target - current) / monthly);
  return m > 1200 ? -1 : m;
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
): number => {
  if (months <= 0) return 0;
  return Math.max(0, Math.round((target - current) / months));
};
