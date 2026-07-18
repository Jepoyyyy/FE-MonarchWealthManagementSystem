import { X } from "lucide-react";
import type { Asset, Product } from "~/types";
import { Btn } from '~/shared/components/Button';

import {
  StockTransactionForm,
  MutualFundTransactionForm,
  BondTransactionForm,
  DepositTransactionForm,
} from "./transaction-forms";

interface AddTransactionModalProps {
  asset: Asset;
  product: Product;
  type: "buy" | "sell";
  onClose: () => void;
  onSaveTransaction: (data: { amount: number; currentValue: number; quantity?: number; method?: "amount" | "units" }) => void;
}

export function AddTransactionModal({ asset, product, type, onClose, onSaveTransaction }: AddTransactionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,33,55,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-foreground">
            {type === "buy" ? "Buy / Top Up" : "Sell / Redeem"} — {product.name}
          </h3>
          <Btn variant="unstyled" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Btn>
        </div>

        {product.type === "Stock" && (
          <StockTransactionForm type={type} currentPrice={asset.currentValue} onClose={onClose} onSubmit={onSaveTransaction} />
        )}

        {(product.type === "Mutual Fund" || product.type === "Money Market" || product.type === "Balanced Fund") && (
          <MutualFundTransactionForm type={type} currentPrice={asset.currentValue} onClose={onClose} onSubmit={onSaveTransaction} />
        )}

        {(product.type === "Bond" || product.type === "Sukuk") && (
          <BondTransactionForm type={type} currentPrice={asset.currentValue} onClose={onClose} onSubmit={onSaveTransaction} />
        )}

        {product.type === "Deposit" && (
          <DepositTransactionForm type={type} rate={product.annualReturn ?? 0} onClose={onClose} onSubmit={onSaveTransaction} />
        )}
      </div>
    </div>
  );
}
