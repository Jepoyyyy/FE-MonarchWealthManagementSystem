import { useState, useEffect, useCallback } from "react";
import { Search, UserCheck, XCircle, CheckCircle, Activity } from "lucide-react";
import type { AuditLog } from "~/types";
import { fmtTs, categoryBadge } from "~/utils";
import { PageHeader } from "~/shared/components/PageHeader";
import { Btn } from "~/shared/components/Button";
import { Badge } from "~/shared/components/Badge";
import { Pagination } from "~/shared/components/Pagination";
import { AdminApi } from "~/features/admin";
import { useDebounce } from "~/shared/hooks/useDebounce";

interface FieldChange {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

interface AdminAuditViewProps {
  logs?: AuditLog[];
}

const actionIcon = (action: string) => {
  if (action.includes("LOGIN")) return <UserCheck size={14} className="text-blue-500" />;
  if (action.includes("SUSPEND") || action.includes("HIDE") || action.includes("FAILED"))
    return <XCircle size={14} className="text-red-500" />;
  if (action.includes("ADD") || action.includes("SHOW") || action.includes("ACTIVATE") || action.includes("CREATE"))
    return <CheckCircle size={14} className="text-emerald-500" />;
  return <Activity size={14} className="text-muted-foreground" />;
};

const parseChanges = (raw: string | null | undefined): FieldChange[] => {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FieldChange[];
  } catch {
    return [];
  }
};

const CATEGORY_OPTIONS = [
  { id: "", label: "All" },
  { id: "AUTH", label: "AUTH" },
  { id: "GOAL", label: "GOAL" },
  { id: "ASSET", label: "ASSET" },
  { id: "PRODUCT", label: "PRODUCT" },
  { id: "USER", label: "USER" },
  { id: "RISK_PROFILE", label: "RISK_PROFILE" },
  { id: "FINANCES", label: "FINANCES" },
];

export function AdminAuditView({ logs: propLogs }: AdminAuditViewProps = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await AdminApi.searchAuditLogs({
        page,
        size: 15,
        sort: "timestamp,desc",
        category: category || undefined,
        search: debouncedSearch || undefined,
      });
      const paged = res.data;
      const content = Array.isArray(paged) ? paged : paged?.content ?? [];
      setLogs(content);
      setTotalPages(paged?.totalPages ?? 1);
      setTotalElements(paged?.totalElements ?? content.length);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      const msg = typeof err === "string" ? err : err?.message || err?.error || (typeof err === "object" ? JSON.stringify(err) : "Failed to load audit logs");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category]);

  const displayLogs = logs.length > 0 ? logs : (propLogs || []);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Trail" subtitle={`${totalElements} total events recorded`} />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between" data-testid="error-message">
          <span>Failed to load audit logs: {error}</span>
          <Btn size="sm" variant="ghost" onClick={() => fetchLogs()}>Retry</Btn>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit logs..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_OPTIONS.map((c) => (
            <Btn
              variant="filter"
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                category === c.id
                  ? "active selected bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {c.label}
            </Btn>
          ))}
        </div>
      </div>

      {/* Table / Empty State */}
      {displayLogs.length === 0 && !loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground" data-testid="empty-state">
          No audit logs found
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-150">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Timestamp", "User", "Action", "Details", "Category", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr data-testid="loading-spinner">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-12 bg-muted rounded animate-pulse"></div>
                  </td>
                </tr>
              ) : (
                displayLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setDetail(log)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
                      {fmtTs(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {log.userName || (log as any).user || (log as any).user_name || log.userId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actionIcon(log.action)}
                        <span className="text-xs font-medium text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={categoryBadge(log.category)}>{log.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {log.changedValue && (
                        <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDetail(log); }}>
                          Diff
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Detail drawer */}
      {detail && (
        <div data-testid="audit-detail-drawer" className="fixed inset-0 z-50 flex animate-fadeIn" style={{ background: "rgba(13,33,55,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setDetail(null)}>
          <div className="flex-1" />
          <div
            data-testid="drawer-content"
            className="w-[450px] bg-card border-l border-border p-6 space-y-4 overflow-y-auto shadow-2xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--card)", color: "var(--foreground)" }}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-sm font-semibold">Event Detail</h2>
              <Btn size="sm" variant="ghost" aria-label="Close" onClick={() => setDetail(null)}>Close</Btn>
            </div>

            <div className="space-y-1 text-xs">
              <DrawerRow label="Action" value={<span className="font-mono">{detail.action}</span>} />
              <DrawerRow label="User" value={detail.userName} />
              <DrawerRow label="Category" value={<Badge className={categoryBadge(detail.category)}>{detail.category}</Badge>} />
              <DrawerRow label="Timestamp" value={fmtTs(detail.timestamp)} />
              <DrawerRow label="Details" value={detail.details} />
            </div>

            {parseChanges(detail.changedValue).length > 0 && (
              <div className="space-y-2" data-testid="field-changes">
                <p className="text-xs font-semibold text-foreground pt-2 border-t border-border">Changes</p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--muted)" }}>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium w-1/3">Field</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Before</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseChanges(detail.changedValue).map((c, i) => {
                        const oldVal = c.old_value ?? (c as any).oldValue;
                        const newVal = c.new_value ?? (c as any).newValue;
                        return (
                          <tr key={i} data-testid="field-change" className="border-t border-border">
                            <td className="px-3 py-2 font-mono text-foreground break-all" data-testid="field-name">{c.field}</td>
                            <td className="px-3 py-2 text-red-600 font-mono break-all" data-testid="old-value">
                              {oldVal == null ? <span className="italic text-muted-foreground">—</span> : String(oldVal)}
                            </td>
                            <td className="px-3 py-2 text-emerald-600 font-mono break-all" data-testid="new-value">
                              {String(newVal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Btn className="w-full mt-4" variant="secondary" aria-label="Close" onClick={() => setDetail(null)}>
              Close
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right break-all">{value}</span>
    </div>
  );
}
