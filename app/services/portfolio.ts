import type { Asset, Product } from "~/types";

export const PortfolioService = {
  calculateCurrentValue(asset: Asset, product: Product, quantityOverride?: number): number {
    const qty = quantityOverride !== undefined ? quantityOverride : (asset.quantity ?? 1);
    const curValNum = asset.currentValue;

    switch (product.type) {
      case "stock":
        return qty * 100 * curValNum;
      case "mutual_fund":
      case "money_market":
        return qty * curValNum;
      case "bond":
        return (asset.quantity ?? asset.amount) * (curValNum / 100);
      case "deposit":
      default:
        return asset.amount;
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
    txQty?: number
  ): Partial<Asset> {
    const qty = txQty || 0;
    const curAmt = asset.amount;
    const curQty = asset.quantity || 0;

    if (type === "buy") {
      switch (product.type) {
        case "stock": {
          const cost = qty * 100 * txPrice;
          return {
            amount: curAmt + cost,
            quantity: curQty + qty,
            currentValue: txPrice,
          };
        }
        case "mutual_fund":
        case "money_market": {
          const cost = qty * txPrice;
          return {
            amount: curAmt + cost,
            quantity: curQty + qty,
            currentValue: txPrice,
          };
        }
        case "bond": {
          const cost = qty * (txPrice / 100);
          return {
            amount: curAmt + cost,
            quantity: curQty + qty,
            currentValue: txPrice,
          };
        }
        case "deposit":
        default:
          return {
            amount: curAmt + txAmount,
            currentValue: curAmt + txAmount,
          };
      }
    } else {
      switch (product.type) {
        case "stock": {
          const avgPrice = curQty > 0 ? curAmt / (curQty * 100) : 0;
          const costReduction = qty * 100 * avgPrice;
          return {
            amount: Math.max(0, curAmt - costReduction),
            quantity: Math.max(0, curQty - qty),
            currentValue: txPrice,
          };
        }
        case "mutual_fund":
        case "money_market": {
          const avgPrice = curQty > 0 ? curAmt / curQty : 0;
          const costReduction = qty * avgPrice;
          return {
            amount: Math.max(0, curAmt - costReduction),
            quantity: Math.max(0, curQty - qty),
            currentValue: txPrice,
          };
        }
        case "bond": {
          const avgPricePercent = curQty > 0 ? (curAmt / curQty) * 100 : 0;
          const costReduction = qty * (avgPricePercent / 100);
          return {
            amount: Math.max(0, curAmt - costReduction),
            quantity: Math.max(0, curQty - qty),
            currentValue: txPrice,
          };
        }
        case "deposit":
        default:
          return {
            amount: Math.max(0, curAmt - txAmount),
            currentValue: Math.max(0, curAmt - txAmount),
          };
      }
    }
  }
};
