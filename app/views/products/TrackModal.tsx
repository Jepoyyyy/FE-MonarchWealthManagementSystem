import { X, ChevronRight } from "lucide-react";
import type { AppUser, Product, Asset, ProductType } from "~/types";
import { ConfirmModal } from "~/components/ui/ConfirmModal";
import { Btn } from "~/components/ui/Btn";
import { useTrackModal } from "~/hooks/useTrackModal";
import { ProductSelectorStep } from "./ProductSelectorStep";
import { TrackFormStep } from "./TrackFormStep";

interface TrackModalProps {
  user: AppUser;
  products: Product[];
  onSave: (a: Omit<Asset, "id">) => void;
  onClose: () => void;
  initialProduct?: Product;
  investableSurplus?: number;
}

export function TrackModal({
  user,
  products,
  onSave,
  onClose,
  initialProduct,
  investableSurplus,
}: TrackModalProps) {
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
  } = useTrackModal({
    user,
    products,
    onSave,
    onClose,
    initialProduct,
    investableSurplus,
  });

  const types: Array<{ id: ProductType | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "money_market", label: "Money Market" },
    { id: "deposit", label: "Deposit" },
    { id: "bond", label: "Bond" },
    { id: "mutual_fund", label: "Mutual Fund" },
    { id: "stock", label: "Stock" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,33,55,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full flex flex-col max-h-[90vh]"
        style={{ maxWidth: step === 0 ? 680 : 520 }}
      >
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
          {step === 0 ? (
            <ProductSelectorStep
              visible={visible}
              userMaxRisk={userMaxRisk}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              types={types}
              onSelect={selectProduct}
            />
          ) : (
            <TrackFormStep
              picked={picked}
              investableSurplus={investableSurplus}
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
