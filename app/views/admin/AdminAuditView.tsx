import { useState, useEffect } from "react";
import { Search, UserCheck, XCircle, CheckCircle, Activity } from "lucide-react";
import type { AuditLog } from "~/types";
import { fmtTs, categoryBadge } from "~/utils";
import { PageHeader } from '~/shared/components/PageHeader';
import { Btn } from '~/shared/components/Button';
import { Badge } from '~/shared/components/Badge';
import { api } from '~/shared/api/client';

interface AdminAuditViewProps {
  logs?: AuditLog[]; // kept for compat but not strictly needed if we fetch all
}

export function AdminAuditView({ logs: propLogs }: AdminAuditViewProps) {
  const [catFilter, setCatFilter] = useState<AuditLog["category"] | "all">("all");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/admin/audit-logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const displayLogs = logs.length > 0 ? logs : (propLogs || []);

  const filtered = displayLogs.filter((l) => {
    if (catFilter !== "all" && l.category !== catFilter) return false;
    if (
      search &&
      !l.action.toLowerCase().includes(search.toLowerCase()) &&
      !l.details.toLowerCase().includes(search.toLowerCase()) &&
      !l.userName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const cats: Array<{ id: AuditLog["category"] | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "auth", label: "Auth" },
    { id: "portfolio", label: "Portfolio" },
    { id: "admin", label: "Admin" },
    { id: "questionnaire", label: "Questionnaire" },
  ];

  const actionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <UserCheck size={14} className="text-blue-500" />;
    if (action.includes("SUSPEND") || action.includes("HIDE") || action.includes("FAILED"))
      return <XCircle size={14} className="text-red-500" />;
    if (action.includes("ADD") || action.includes("SHOW") || action.includes("ACTIVATE"))
      return <CheckCircle size={14} className="text-emerald-500" />;
    return <Activity size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Trail" subtitle={`${displayLogs.length} total events recorded`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, users, details…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map((c) => (
            <Btn
              variant="unstyled"
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                catFilter === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {c.label}
            </Btn>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {["Timestamp", "User", "Action", "Details", "Category"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground animate-pulse">
                  Loading logs...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No events match your filters
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td
                    className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {fmtTs(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {actionIcon(log.action)}
                      <span
                        className="text-xs font-medium text-foreground"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
