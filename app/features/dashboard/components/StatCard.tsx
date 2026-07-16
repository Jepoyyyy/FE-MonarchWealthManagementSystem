import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title?: string;
  label?: string; // mapping to title for monolith compatibility
  value: string | number;
  unit?: "currency" | "percent" | "count";
  icon?: LucideIcon | React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, label, value, unit, icon, sub, trend }: StatCardProps) {
  const displayTitle = title || label || "";

  const formatValue = (val: string | number, unitType?: string): string => {
    if (typeof val === "string") return val;

    switch (unitType) {
      case "currency":
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);

      case "percent":
        return new Intl.NumberFormat("id-ID", {
          style: "percent",
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        }).format(val / 100);

      case "count":
        return new Intl.NumberFormat("id-ID").format(val);

      default:
        return String(val);
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "function") {
      const IconComp = icon as LucideIcon;
      return <IconComp className="h-5 w-5 text-gray-400" />;
    }
    return icon;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {displayTitle}
        </span>
        <span className="text-muted-foreground">{renderIcon()}</span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
          {formatValue(value, unit)}
        </p>
        {sub && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 ${
            trend === "up" ? "text-emerald-600 font-medium" : trend === "down" ? "text-red-500 font-medium" : "text-muted-foreground"
          }`}>
            {trend === "up" && <ArrowUpRight size={12} />}
            {trend === "down" && <ArrowDownRight size={12} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
