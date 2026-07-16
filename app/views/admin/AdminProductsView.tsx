import { useState, useEffect } from "react";
import { CheckCircle, XCircle, EyeOff, Eye } from "lucide-react";
import type { Product, AppUser, AuditLog } from "~/types";
import { fmt, statusBadge } from "~/utils";
import { ProductTypeBadge } from "~/components/ui/ProductTypeBadge";
import { Btn } from '~/shared/components/Button';
import { RiskLevelBadge } from "~/components/ui/RiskLevelBadge";
import { PageHeader } from '~/shared/components/PageHeader';
import { Badge } from '~/shared/components/Badge';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { useProductsStore } from "~/stores/productsStore";
import { ProductApi } from "~/api/products";

interface AdminProductsViewProps {
  addLog: (l: Omit<AuditLog, "id">) => void;
  adminUser: AppUser;
  toast: any;
}

export function AdminProductsView({
  addLog,
  adminUser,
  toast,
}: AdminProductsViewProps) {
  const [toggleConfirm, setToggleConfirm] = useState<{ id: string; action: "show" | "hide" } | null>(null);

  const { products, loading, fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleProduct = async (id: string, next: boolean) => {
    const p = products.find((pr) => pr.id === id)!;
    try {
      await ProductApi.update(id, { visible: next });
      addLog({
        userId: adminUser.id,
        userName: adminUser.name,
        action: next ? "SHOW_PRODUCT" : "HIDE_PRODUCT",
        details: `Product '${p.name}' set to ${next ? "visible" : "hidden"}`,
        timestamp: new Date().toISOString(),
        category: "admin",
      });
      toast.success(`Product ${next ? "ditampilkan" : "disembunyikan"}`, {
        description: `"${p.name}" sekarang ${next ? "visible" : "hidden"}`,
      });
      fetchProducts();
    } catch (err: any) {
       toast.error("Gagal mengubah visibilitas", { description: err.message });
    } finally {
      setToggleConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Product Management" subtitle="Control product visibility across all user risk profiles" />

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
           Loading products...
        </div>
      ) : (
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {["Product", "Type", "Risk Level", "Annual Return", "Min. Investment", "Status", "Visibility"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-border last:border-0 transition-colors ${
                  !p.visible ? "opacity-50" : "hover:bg-muted/20"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProductTypeBadge type={p.type} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.issuer}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ProductTypeBadge type={p.type} />
                </td>
                <td className="px-4 py-3">
                  <RiskLevelBadge level={p.riskLevel} />
                </td>
                <td
                  className="px-4 py-3 text-xs font-semibold text-accent"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.annualReturn}%
                </td>
                <td
                  className="px-4 py-3 text-xs text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fmt(p.minInvestment)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={p.visible ? "good" : "secondary"}
                  >
                    {p.visible ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {p.visible ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Btn
                    variant="unstyled"
                    onClick={() => setToggleConfirm({ id: p.id, action: p.visible ? "hide" : "show" })}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-75 cursor-pointer"
                    style={{ color: p.visible ? "var(--destructive)" : "var(--chart-3)" }}
                  >
                    {p.visible ? (
                      <>
                        <EyeOff size={13} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Show
                      </>
                    )}
                  </Btn>
                </td>
              </tr>
            ))}
            {toggleConfirm && (
              <ConfirmModal
                open={!!toggleConfirm}
                onOpenChange={() => setToggleConfirm(null)}
                title={toggleConfirm.action === "hide" ? "Sembunyikan produk?" : "Tampilkan produk?"}
                message={
                  toggleConfirm.action === "hide"
                    ? "Produk tidak akan terlihat oleh user."
                    : "Produk akan tersedia untuk semua user."
                }
                confirmLabel={toggleConfirm.action === "hide" ? "Ya, sembunyikan" : "Ya, tampilkan"}
                confirmVariant={toggleConfirm.action === "hide" ? "danger" : "primary"}
                onConfirm={() => toggleProduct(toggleConfirm.id, toggleConfirm.action === "show")}
              />
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
