import type { Asset, Product, ProductType } from "~/types";

/** Per-unit cost multiplier relative to face/NAV price. */
const BUY_MULT: Record<ProductType, number> = {
  "Money Market": 1,
  "Bank Deposit": 1,
  "Bond": 1 / 100,
  "Mutual Fund": 1,
  "Stock": 100,
  "Balanced Fund": 1,
  "Sukuk": 1 / 100,
};

export const PortfolioService = {

  processTransaction(
    asset: Asset,
    product: Product,
    type: "buy" | "sell",
    txAmount: number,
    txPrice: number,
    txQty?: number,
  ): Partial<Asset> {
    const qty = txQty || 0;
    const curAmt = asset.amount;
    const curQty = asset.quantity || 0;
    const ptype = product.type;

    // Bank Deposit — amount-based, no quantity concept
    if (ptype === "Bank Deposit") {
      const next = type === "buy"
        ? { amount: curAmt + txAmount, currentValue: curAmt + txAmount }
        : { amount: Math.max(0, curAmt - txAmount), currentValue: Math.max(0, curAmt - txAmount) };
      return next;
    }

    if (type === "buy") {
      const cost = qty * BUY_MULT[ptype] * txPrice;
      return { amount: curAmt + cost, quantity: curQty + qty, currentValue: txPrice };
    }

    // Sell — all non-deposit types share the same weighted-average formula
    const avgPrice = curQty > 0 ? curAmt / curQty : 0;
    const costReduction = qty * avgPrice;
    return {
      amount: Math.max(0, curAmt - costReduction),
      quantity: Math.max(0, curQty - qty),
      currentValue: txPrice,
    };
  },
};
