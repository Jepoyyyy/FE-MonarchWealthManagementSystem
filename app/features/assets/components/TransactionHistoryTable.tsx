import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { TransactionHistory } from "~/types";
import { AssetApi } from "../api";
import { fmt } from "~/utils";

interface TransactionHistoryTableProps {
  assetId: string;
}

export function TransactionHistoryTable({ assetId }: TransactionHistoryTableProps) {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        const res = await AssetApi.fetchAssetTransactions(assetId);
        setTransactions(res.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load transaction history");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [assetId]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No transaction history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Units</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Price/Unit</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => {
              const isBuy = tx.action === "BUY";
              const date = new Date(tx.transactionDate);
              const formattedDate = date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm text-foreground">{formattedDate}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        isBuy
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {isBuy ? (
                        <ArrowUpRight size={12} />
                      ) : (
                        <ArrowDownRight size={12} />
                      )}
                      {tx.action}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3 text-sm text-right text-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {tx.units.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td
                    className="px-5 py-3 text-sm text-right text-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {fmt(tx.pricePerUnit)}
                  </td>
                  <td
                    className={`px-5 py-3 text-sm text-right font-semibold ${
                      isBuy ? "text-emerald-600" : "text-red-500"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {isBuy ? "+" : "-"}
                    {fmt(tx.totalAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
