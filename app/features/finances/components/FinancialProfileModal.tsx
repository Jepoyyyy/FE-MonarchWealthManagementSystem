import { useState, useEffect } from "react";
import { X, DollarSign, Home, ShoppingCart, Car, Zap, Heart, Smile, Shield, MoreHorizontal } from "lucide-react";
import { FinancesApi, type FinancialProfileData } from "../api";
import { Btn } from "~/shared/components/Button";
import { toast } from "sonner";
import { fmt } from "~/utils";

interface FinancialProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FinancialProfileData) => void;
  initialData?: Partial<FinancialProfileData>;
}

const expenseCategories = [
  { key: "housing", label: "Housing & Rent", icon: Home, placeholder: "e.g., 5,000,000" },
  { key: "food", label: "Food & Groceries", icon: ShoppingCart, placeholder: "e.g., 3,000,000" },
  { key: "transport", label: "Transportation", icon: Car, placeholder: "e.g., 1,500,000" },
  { key: "utilities", label: "Utilities (Water, Electric)", icon: Zap, placeholder: "e.g., 800,000" },
  { key: "healthcare", label: "Healthcare & Medical", icon: Heart, placeholder: "e.g., 500,000" },
  { key: "entertainment", label: "Entertainment & Leisure", icon: Smile, placeholder: "e.g., 1,000,000" },
  { key: "insurance", label: "Insurance Premiums", icon: Shield, placeholder: "e.g., 600,000" },
  { key: "other", label: "Other Expenses", icon: MoreHorizontal, placeholder: "e.g., 500,000" },
];

export function FinancialProfileModal({ open, onClose, onSave, initialData }: FinancialProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialProfileData>({
    monthlyIncome: 0,
    housing: 0,
    food: 0,
    transport: 0,
    utilities: 0,
    healthcare: 0,
    entertainment: 0,
    insurance: 0,
    other: 0,
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        monthlyIncome: initialData.monthlyIncome ?? 0,
        housing: initialData.housing ?? 0,
        food: initialData.food ?? 0,
        transport: initialData.transport ?? 0,
        utilities: initialData.utilities ?? 0,
        healthcare: initialData.healthcare ?? 0,
        entertainment: initialData.entertainment ?? 0,
        insurance: initialData.insurance ?? 0,
        other: initialData.other ?? 0,
      });
    }
  }, [open, initialData]);

  const totalExpenses = 
    formData.housing +
    formData.food +
    formData.transport +
    formData.utilities +
    formData.healthcare +
    formData.entertainment +
    formData.insurance +
    formData.other;

  const surplus = formData.monthlyIncome - totalExpenses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.monthlyIncome <= 0) {
      toast.error("Monthly income must be greater than zero");
      return;
    }

    try {
      setLoading(true);
      await FinancesApi.update(formData);
      toast.success("Financial profile updated successfully");
      onSave(formData);
      onClose();
    } catch (err: any) {
      toast.error("Failed to update financial profile", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FinancialProfileData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
              Financial Profile
            </h2>
            <p className="text-sm text-muted-foreground">Manage your monthly income and expenses</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Monthly Income */}
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-primary" />
                Monthly Income
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyIncome || ""}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                placeholder="e.g., 15,000,000"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Expense Categories */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Expenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseCategories.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <Icon size={14} />
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData[key as keyof FinancialProfileData] || ""}
                      onChange={(e) => handleInputChange(key as keyof FinancialProfileData, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-md border border-border bg-input-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/30 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Income</span>
                <span className="text-sm font-semibold text-foreground font-mono">{fmt(formData.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-sm font-semibold text-foreground font-mono">{fmt(totalExpenses)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Monthly Surplus</span>
                <span 
                  className={`text-base font-bold font-mono ${
                    surplus >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {surplus >= 0 ? "+" : ""}{fmt(surplus)}
                </span>
              </div>
              {surplus < 0 && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Your expenses exceed your income. Consider adjusting your budget.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Btn variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Btn>
            <Btn type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
