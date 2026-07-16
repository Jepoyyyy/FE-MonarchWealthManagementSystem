// formatting utilities split from app/utils.tsx
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

export const fmtDuration = (months: number): string => {
  if (months === 0) return "Reached!";
  if (months < 0) return "100+ years";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}yr`;
  return `${y}yr ${m}mo`;
};
