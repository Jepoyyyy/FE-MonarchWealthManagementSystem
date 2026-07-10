import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: "currency" | "percent" | "count";
  icon?: LucideIcon;
}

export function StatCard({ title, value, unit, icon: Icon }: StatCardProps) {
  const formatValue = (val: string | number, unitType?: string): string => {
    // If value is already a string, return as-is
    if (typeof val === "string") return val;

    // Handle numeric formatting
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">
          {title}
        </h3>
        {Icon && (
          <Icon className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 ">
        {formatValue(value, unit)}
      </p>
    </div>
  );
}
