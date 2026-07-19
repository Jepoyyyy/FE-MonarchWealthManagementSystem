import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, UserX, Eye } from "lucide-react";
import type { AppUser, AuditLog, UserStatus, AdminUserDetail } from "~/types";
import { fmtDate, fmt, statusBadge } from "~/utils";
import { RiskBadge } from '~/features/profile/components/RiskBadge';
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Badge } from '~/shared/components/Badge';
import { Btn } from '~/shared/components/Button';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { Pagination } from "~/shared/components/Pagination";
import { AdminApi } from '~/features/admin';
import { useDebounce } from "~/shared/hooks/useDebounce";
import { DashboardApi } from "~/features/dashboard/api";

interface AdminUsersViewProps {
  addLog: (l: Omit<AuditLog, "id">) => void;
  adminUser: AppUser;
  toast: any;
}

export function AdminUsersView({
  addLog,
  adminUser,
  toast,
}: AdminUsersViewProps) {
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [confirmUserToggle, setConfirmUserToggle] = useState<{ id: string; next: UserStatus } | null>(null);

  const [dashboardStats, setDashboardStats] = useState<{ total: number; active: number; suspended: number } | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await DashboardApi.getAdminDashboard();
      const total = res.data.user_count;
      const active = res.data.active_user_count;
      const suspended = total - active;
      setDashboardStats({ total, active, suspended });
    } catch (err) {
      console.error("Failed to load admin dashboard stats in users view:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApi.listUsers({
        page,
        size: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      const paged = res.data;
      const content = Array.isArray(paged) ? paged : paged?.content ?? [];
      setUsers(content);
      setTotalPages(paged?.totalPages ?? 1);
      setTotalUsers(paged?.totalElements ?? content.length);
    } catch (err: any) {
      toast.error("Failed to load users", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  const toggleStatus = async (id: string, next: UserStatus) => {
    const u = users.find((us) => us.id === id)!;
    try {
      await AdminApi.updateUser(id, { status: next });
      addLog({
        userId: adminUser.id,
        userName: adminUser.name,
        action: next === "suspended" ? "SUSPEND_USER" : "ACTIVATE_USER",
        details: `User '${u.name}' status changed to ${next}`,
        timestamp: new Date().toISOString(),
        category: "admin",
      });
      toast.success(`User ${next === "active" ? "diaktifkan" : "disuspend"}`, {
        description: `${u.name} sekarang ${next === "active" ? "aktif" : "disuspend"}`,
      });
      fetchUsers();
      fetchDashboardStats();
    } catch (err: any) {
      toast.error("Gagal mengubah status user", { description: err.message });
    } finally {
      setConfirmUserToggle(null);
    }
  };

  const activeCount = dashboardStats ? dashboardStats.active : users.filter((u) => u.status === "active").length;
  const suspendedCount = dashboardStats ? dashboardStats.suspended : users.filter((u) => u.status === "suspended").length;
  const displayTotalUsers = dashboardStats ? dashboardStats.total : totalUsers;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle={`${displayTotalUsers} registered users`} />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Total Users" value={String(displayTotalUsers)} icon={<Users size={16} />} />
        <StatCard
          label="Active"
          value={String(activeCount)}
          icon={<UserCheck size={16} />}
          trend="up"
        />
        <StatCard
          label="Suspended"
          value={String(suspendedCount)}
          icon={<UserX size={16} />}
          trend={suspendedCount > 0 ? "down" : "neutral"}
        />
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
           Loading users...
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-150">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["User", "Risk Profile", "Joined", "Status", "Actions"].map((h) => (
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
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "var(--primary)" }}
                        >
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.riskProfile ? (
                        <RiskBadge profile={u.riskProfile} showDot />
                      ) : (
                        <span className="text-xs text-muted-foreground">Not set</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadge(u.status)}>
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Btn size="sm" variant="ghost" onClick={() => setDetail(u)} title="View detail">
                        <Eye size={13} />
                      </Btn>
                      <Btn
                        size="sm"
                        variant={u.status === "active" ? "danger" : "secondary"}
                        onClick={() =>
                          setConfirmUserToggle({
                            id: u.id,
                            next: u.status === "active" ? "suspended" : "active",
                          })
                        }
                      >
                        {u.status === "active" ? (
                          <>
                            <UserX size={13} /> Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck size={13} /> Activate
                          </>
                        )}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* User detail drawer */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setDetail(null)}
        >
          <div className="flex-1 bg-black/40" />
          <div
            className="w-80 bg-card border-l border-border p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--card)", color: "var(--foreground)" }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-sm font-semibold text-foreground">User Detail</h2>
                <Btn size="sm" variant="ghost" onClick={() => setDetail(null)}>✕</Btn>
              </div>
              <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-border">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {detail.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{detail.name}</h3>
                  <p className="text-xs text-muted-foreground">{detail.email}</p>
                </div>
              </div>
              <div className="space-y-4 text-xs">
                <Row label="User ID" value={detail.id} />
                <Row label="Role" value={detail.role} />
                <Row label="Status" value={<Badge className={statusBadge(detail.status)}>{detail.status}</Badge>} />
                <Row
                  label="Risk Profile"
                  value={detail.riskProfile ? <RiskBadge profile={detail.riskProfile} showDot /> : "Not set"}
                />
                <Row label="Questionnaire" value={detail.questionnaireCompleted ? "Completed" : "Pending"} />
                <Row label="Joined" value={fmtDate(detail.createdAt)} />
                <Row label="Last Updated" value={fmtDate(detail.updatedAt)} />
              </div>
            </div>
            <Btn className="w-full mt-6" variant="secondary" onClick={() => setDetail(null)}>
              Close
            </Btn>
          </div>
        </div>
      )}

      {confirmUserToggle && (
        <ConfirmModal
          open={!!confirmUserToggle}
          onOpenChange={() => setConfirmUserToggle(null)}
          title={confirmUserToggle.next === "suspended" ? "Suspend user ini?" : "Aktifkan user ini?"}
          message={
            confirmUserToggle.next === "suspended"
              ? "User tidak bisa login sampai diaktifkan lagi."
              : "User akan bisa login kembali."
          }
          confirmLabel={confirmUserToggle.next === "suspended" ? "Ya, suspend" : "Ya, aktifkan"}
          confirmVariant={confirmUserToggle.next === "suspended" ? "danger" : "primary"}
          onConfirm={() => toggleStatus(confirmUserToggle.id, confirmUserToggle.next)}
        />
      )}
    </div>
  );
}

// Inline row component for drawer detail rendering
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-2 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground text-left">{label}</span>
      <span className="text-foreground font-medium text-right break-all">{value}</span>
    </div>
  );
}
