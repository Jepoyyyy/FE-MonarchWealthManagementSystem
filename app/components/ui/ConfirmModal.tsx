import { AlertTriangle } from "lucide-react";
import { Btn } from "./Btn";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  confirmVariant = "danger",
  onConfirm,
}: ConfirmModalProps) {
  const iconBg = confirmVariant === "danger" ? "bg-red-500/10" : "bg-primary/10";
  const iconColor = confirmVariant === "danger" ? "text-red-500" : "text-primary";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200"
      style={{ background: "rgba(13,33,55,0.6)", backdropFilter: "blur(6px)" }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border/50 p-6 sm:p-8 transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
            <AlertTriangle size={28} className={iconColor} />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Btn
            variant="secondary"
            className="flex-1 order-2 sm:order-1"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Btn>
          <Btn
            variant={confirmVariant}
            className="flex-1 order-1 sm:order-2"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel ?? "Ya, lanjutkan"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
