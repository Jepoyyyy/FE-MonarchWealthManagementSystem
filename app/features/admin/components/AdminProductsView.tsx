import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, EyeOff, Eye, Plus } from "lucide-react";
import type { AppUser, AuditLog, ProductType } from "~/types";
import type { Product } from "~/features/products/products.types";
import { fmt } from "~/utils";
import { ProductTypeBadge } from "~/features/products/components/ProductTypeBadge";
import { Btn } from "~/shared/components/Button";
import { RiskLevelBadge } from "~/features/profile/components/RiskLevelBadge";
import { PageHeader } from "~/shared/components/PageHeader";
import { Badge } from "~/shared/components/Badge";
import { ConfirmModal } from "~/shared/components/ConfirmModal";
import { Pagination } from "~/shared/components/Pagination";
import { Input } from "~/shared/components/Input";
import { AdminApi } from "~/features/admin/api";
import { useDebounce } from "~/shared/hooks/useDebounce";
import { AdminAddProductModal } from "./AdminAddProductModal";
import type { AdminProductCreateDTO } from "~/features/admin/admin.types";
import { PRODUCT_TYPE_OPTIONS } from "~/constants/productTypes";

interface AdminProductsViewProps {
  addLog: (l: Omit<AuditLog, "id">) => void;
  adminUser: AppUser;
  toast: any;
}

export function AdminProductsView({ addLog, adminUser, toast }: AdminProductsViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [toggleConfirm, setToggleConfirm] = useState<{ id: string; name: string; next: boolean } | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApi.listAdminProducts({
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        page,
        size: 15,
      });
      const paged = res.data;
      const content = Array.isArray(paged) ? paged : paged?.content ?? [];
      setProducts(content);
      setTotalPages(paged?.totalPages ?? 1);
      setTotalElements(paged?.totalElements ?? content.length);
    } catch (err: any) {
      toast.error("Failed to load products", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, page, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, typeFilter]);

  const doToggle = async () => {
    if (!toggleConfirm) return;
    const { id, name, next } = toggleConfirm;
    try {
      await AdminApi.updateAdminProduct(id, { visible: next });
      addLog({
        userId: adminUser.id,
        userName: adminUser.name,
        action: next ? "SHOW_PRODUCT" : "HIDE_PRODUCT",
        details: `Product '${name}' set to ${next ? "visible" : "hidden"}`,
        timestamp: new Date().toISOString(),
        category: "admin",
      });
      toast.success(`Product ${next ? "ditampilkan" : "disembunyikan"}`, {
        description: `"${name}" sekarang ${next ? "visible" : "hidden"}`,
      });
      fetchProducts();
    } catch (err: any) {
      toast.error("Gagal mengubah visibilitas", { description: err.message });
    } finally {
      setToggleConfirm(null);
    }
  };

  const doCreate = async (dto: AdminProductCreateDTO) => {
    await AdminApi.createProduct(dto);
    addLog({
      userId: adminUser.id,
      userName: adminUser.name,
      action: "CREATE_PRODUCT",
      details: `Product '${dto.name}' (${dto.code}) created`,
      timestamp: new Date().toISOString(),
      category: "admin",
    });
    toast.success("Product created", { description: dto.name });
    fetchProducts();
  };

  const visibleCount = products.filter((p) => p.visible).length;
  const productTypes = PRODUCT_TYPE_OPTIONS
    .map((opt) => opt.id)
    .filter((id): id is ProductType => id !== "all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Management"
        subtitle={`${totalElements} products · ${visibleCount} visible on this page`}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or issuer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          className="border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Btn
          variant="primary"
          className="ml-auto flex items-center gap-1.5"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={14} /> Add Product
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
          Loading products...
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["Product", "Type", "Risk", "Annual Return", "Min. Investment", "Price", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        !p.visible ? "opacity-50 hover:bg-muted/10" : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.issuer} · {p.code}
                        </p>
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
                      <td
                        className="px-4 py-3 text-xs text-foreground"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {fmt(p.currentPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.visible ? "good" : "secondary"}>
                          {p.visible ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {p.visible ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Btn
                          variant="unstyled"
                          onClick={() => setToggleConfirm({ id: p.id, name: p.name, next: !p.visible })}
                          className="flex items-center gap-1.5 text-xs font-medium hover:opacity-75 cursor-pointer"
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {toggleConfirm && (
        <ConfirmModal
          open={!!toggleConfirm}
          onOpenChange={() => setToggleConfirm(null)}
          title={toggleConfirm.next ? "Tampilkan produk?" : "Sembunyikan produk?"}
          message={
            toggleConfirm.next
              ? "Produk akan tersedia untuk semua user."
              : "Produk tidak akan terlihat oleh user."
          }
          confirmLabel={toggleConfirm.next ? "Ya, tampilkan" : "Ya, sembunyikan"}
          confirmVariant={toggleConfirm.next ? "primary" : "danger"}
          onConfirm={doToggle}
        />
      )}

      <AdminAddProductModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={doCreate} />
    </div>
  );
}
