import { useState } from "react";
import { Input } from "~/shared/components/Input";
import { Btn } from "~/shared/components/Button";
import type { AdminProductCreateDTO } from "~/features/admin/admin.types";
import { PRODUCT_TYPE_OPTIONS } from "~/constants/productTypes";
import type { ProductType } from "~/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: AdminProductCreateDTO) => Promise<void>;
}

const BLANK: AdminProductCreateDTO = {
  code: "",
  name: "",
  issuer: "",
  type: "",
  riskLevel: 1,
  annualReturn: 0,
  minInvestment: 0,
  currentPrice: 0,
  description: "",
  tenor: "",
  lotSize: 1,
  isFractionalAllowed: false,
  visible: true,
};

export function AdminAddProductModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<AdminProductCreateDTO>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const set = (k: keyof AdminProductCreateDTO, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      setForm(BLANK);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const productTypes = PRODUCT_TYPE_OPTIONS
    .map((opt) => opt.id)
    .filter((id): id is ProductType => id !== "all");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200"
      style={{ background: "rgba(13,33,55,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--card)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">Add New Product</h2>
          <Btn size="sm" variant="ghost" onClick={onClose} disabled={saving}>✕</Btn>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              placeholder="e.g. SBN001"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              required
            />
            <Input
              label="Name"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <Input
              label="Issuer"
              placeholder="e.g. Pemerintah RI"
              value={form.issuer}
              onChange={(e) => set("issuer", e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                className="w-full border border-border rounded-md px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                style={{ background: "var(--input-background)", color: "var(--foreground)" }}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                required
              >
                <option value="">Select Type</option>
                {productTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Risk Level (1-5)"
              type="number"
              min={1}
              max={5}
              placeholder="1"
              value={form.riskLevel}
              onChange={(e) => set("riskLevel", Number(e.target.value))}
              required
            />
            <Input
              label="Annual Return (%)"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={form.annualReturn}
              onChange={(e) => set("annualReturn", Number(e.target.value))}
              required
            />
            <Input
              label="Min Investment"
              type="number"
              min={0}
              placeholder="100000"
              value={form.minInvestment}
              onChange={(e) => set("minInvestment", Number(e.target.value))}
              required
            />
            <Input
              label="Current Price"
              type="number"
              min={0}
              placeholder="1000"
              value={form.currentPrice}
              onChange={(e) => set("currentPrice", Number(e.target.value))}
              required
            />
            <Input
              label="Tenor"
              placeholder="e.g. 3 Years (Optional)"
              value={form.tenor ?? ""}
              onChange={(e) => set("tenor", e.target.value)}
            />
            <Input
              label="Lot Size"
              type="number"
              min={1}
              placeholder="1"
              value={form.lotSize}
              onChange={(e) => set("lotSize", Number(e.target.value))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-background text-foreground"
              style={{ background: "var(--input-background)", color: "var(--foreground)" }}
              placeholder="Product Description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-6 text-sm text-foreground pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFractionalAllowed}
                onChange={(e) => set("isFractionalAllowed", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              Fractional Allowed
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => set("visible", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              Visible
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
            <Btn type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Btn>
            <Btn type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Create Product"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
