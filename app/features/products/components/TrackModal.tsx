import { useEffect, useRef } from "react";
import { X, ChevronRight, AlertTriangle } from "lucide-react";
import type { AppUser, Product, Asset } from "~/types";
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { Btn } from '~/shared/components/Button';
import { useTrackModal } from '~/features/products/hooks/useTrackModal';
import { ProductSelectorStep } from "./ProductSelectorStep";
import { TrackFormStep } from "./TrackFormStep";
import { PRODUCT_TYPE_OPTIONS } from "~/constants/productTypes";

interface TrackModalProps {
  user: AppUser;
  products: Product[];
  onSave: (a: Omit<Asset, "id">) => void;
  onClose: () => void;
  initialProduct?: Product;
}

export function TrackModal({
  user,
  products,
  onSave,
  onClose,
  initialProduct,
}: TrackModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("input, button, select, textarea");
    first?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (step === 1 && (amount || currentVal)) setShowConfirmCancelTrack(true);
      else onClose();
    }
  };
  const {
    step,
    setStep,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    picked,
    setPicked,
    amount,
    setAmount,
    currentVal,
    quantity,
    setQuantity,
    tenorMonths,
    setTenorMonths,
    date,
    setDate,
    platform,
    setPlatform,
    notes,
    setNotes,
    err,
    showConfirmCancelTrack,
    setShowConfirmCancelTrack,
    userMaxRisk,
    isStock,
    isDeposit,
    isMF,
    isBond,
    visible,
    selectProduct,
    parsedAmount,
    submit,
    isLoadingProduct,
    productError,
    setProductError,
  } = useTrackModal({
    user,
    products,
    onSave,
    onClose,
    initialProduct,
  });

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={step === 0 ? "Choose a Product" : "Track Investment"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(13,33,55,0.75)] backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-card rounded-2xl shadow-2xl border border-border w-full flex flex-col max-h-[90vh] relative ${step === 0 ? "max-w-170" : "max-w-130"}`}
      >
        {isLoadingProduct && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b border-border"
        >
          <div className="flex items-center gap-3">
            {step === 1 && !initialProduct && (
              <Btn
                variant="unstyled"
                onClick={() => {
                  setStep(0);
                  setPicked(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              >
                <ChevronRight size={18} className="rotate-180" />
              </Btn>
            )}
            <div>
              <h3
                className="font-bold text-base text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step === 0 ? "Choose a Product" : "Track Investment"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 0 ? "Select the product you purchased" : picked?.name}
              </p>
            </div>
          </div>
          <Btn
            variant="unstyled"
            onClick={() => {
              if (step === 1 && (amount || currentVal)) setShowConfirmCancelTrack(true);
              else onClose();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </Btn>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 0 && productError && (
            <div className="mx-6 mt-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <p>{productError}</p>
                <button
                  onClick={() => setProductError(null)}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1 block"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          {step === 0 ? (
            <ProductSelectorStep
              visible={visible}
              userMaxRisk={userMaxRisk}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              types={PRODUCT_TYPE_OPTIONS}
              onSelect={selectProduct}
            />
          ) : (
            <TrackFormStep
              picked={picked}
              amount={amount}
              setAmount={setAmount}
              currentVal={currentVal}
              quantity={quantity}
              setQuantity={setQuantity}
              isStock={isStock}
              isDeposit={isDeposit}
              isMF={isMF}
              isBond={isBond}
              parsedAmount={parsedAmount}
              tenorMonths={tenorMonths}
              setTenorMonths={setTenorMonths}
              date={date}
              setDate={setDate}
              platform={platform}
              setPlatform={setPlatform}
              notes={notes}
              setNotes={setNotes}
              err={err}
            />
          )}
        </div>

        {step === 1 && (
          <div className="flex gap-3 px-6 py-4 border-t border-border">
            <Btn
              variant="secondary"
              className="flex-1"
              onClick={() => {
                if (amount || currentVal) setShowConfirmCancelTrack(true);
                else onClose();
              }}
            >
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={submit}>
              Record Position
            </Btn>
          </div>
        )}
      </div>

      {showConfirmCancelTrack && (
        <ConfirmModal
          open={showConfirmCancelTrack}
          onOpenChange={setShowConfirmCancelTrack}
          title="Batalkan tracking?"
          message="Data yang sudah diisi akan hilang."
          confirmLabel="Ya, batalkan"
          onConfirm={onClose}
        />
      )}
    </div>
  );
}
