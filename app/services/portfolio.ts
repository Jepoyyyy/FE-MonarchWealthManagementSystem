import type { Asset, Product, ProductType } from "~/types";

/** Per-unit cost multiplier relative to face/NAV price. */
const BUY_MULT: Record<ProductType, number> = {
  stock: 100,
  mutual_fund: 1,
  money_market: 1,
  bond: 1 / 100,
  deposit: 1, // not used in practice — deposit hits a separate path
};

export const PortfolioService = {
  calculateCurrentValue(asset: Asset, product: Product, quantityOverride?: number): number {
    const qty = quantityOverride ?? asset.quantity ?? 1;
    switch (product.type) {
      case "stock": return qty * 100 * asset.currentValue;
      case "mutual_fund":
      case "money_market": return qty * asset.currentValue;
      case "bond": return qty * (asset.currentValue / 100);
      case "deposit":
      default: return asset.amount;
    }
  },

  calculatePNL(amountInvested: number, currentAssetValue: number, averagePrice: number, currentPrice: number): {
    pnlAmt: number;
    pnlPct: number;
  } {
    const pnlAmt = currentAssetValue - amountInvested;
    const pnlPct = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;
    return { pnlAmt, pnlPct };
  },

  calculateAverageValue(asset: Asset): number {
    return asset.quantity && asset.quantity > 0 ? asset.amount / asset.quantity : asset.amount;
  },

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

    // Deposit — amount-based, no quantity concept
    if (ptype === "deposit") {
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
