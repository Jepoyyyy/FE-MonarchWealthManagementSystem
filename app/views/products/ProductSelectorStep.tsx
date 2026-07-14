import { Search } from "lucide-react";
import type { Product, ProductType } from "~/types";
import { Badge } from "~/components/ui/Badge";
import { Btn } from "~/components/ui/Btn";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";

interface ProductSelectorStepProps {
  visible: Product[];
  userMaxRisk: number;
  search: string;
  setSearch: (val: string) => void;
  typeFilter: ProductType | "all";
  setTypeFilter: (val: ProductType | "all") => void;
  types: Array<{ id: ProductType | "all"; label: string }>;
  onSelect: (p: Product) => void;
}

export function ProductSelectorStep({
  visible,
  userMaxRisk,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  types,
  onSelect,
}: ProductSelectorStepProps) {
  return (
    <div className="p-5">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or issuer…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: "var(--border)",
              background: "var(--input-background)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {types.map((t) => (
            <Btn
              variant="unstyled"
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                typeFilter === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t.label}
            </Btn>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {visible.map((p) => {
          const aboveProfile = p.riskLevel > userMaxRisk;
          return (
            <Btn
              variant="unstyled"
              key={p.id}
              onClick={() => onSelect(p)}
              className="text-left p-3.5 rounded-xl border-2 transition-all hover:shadow-sm border-border bg-muted hover:border-primary"
            >
              <div className="flex items-start justify-between mb-2">
                <ProductTypeBadge type={p.type} />
                <div className="flex flex-col items-end gap-1">
                  <RiskLevelBadge level={p.riskLevel} />
                  {aboveProfile && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                      Above profile
                    </Badge>
                  )}
                </div>
              </div>
              <p
                className="text-xs font-semibold leading-tight mb-0.5 text-foreground"
              >
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{p.issuer}</p>
              <div
                className="flex items-center justify-between pt-2 border-t border-border"
              >
                <span
                  className="text-sm font-bold text-accent"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.annualReturn}%
                </span>
                <ProductTypeBadge type={p.type} />
              </div>
            </Btn>
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-2 py-12 text-center text-sm text-muted-foreground">
            No products match your search
          </div>
        )}
      </div>
    </div>
  );
}
