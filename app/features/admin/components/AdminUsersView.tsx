import { useState, useEffect } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import type { AppUser, AuditLog, UserStatus } from "~/types";
import { fmtDate, fmt, statusBadge } from "~/utils";
import { RiskBadge } from '~/features/profile/components/RiskBadge';
import { PageHeader } from '~/shared/components/PageHeader';
import { StatCard } from '~/features/dashboard/components/StatCard';
import { Badge } from '~/shared/components/Badge';
import { Btn } from '~/shared/components/Button';
import { ConfirmModal } from '~/shared/components/ConfirmModal';
import { api } from '~/shared/api/client';

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
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v2/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error("Failed to load users", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const regularUsers = users.filter((u) => u.role === "user");
  const [confirmUserToggle, setConfirmUserToggle] = useState<{ id: string; next: UserStatus } | null>(null);

  const toggleStatus = async (id: string, next: UserStatus) => {
    const u = users.find((us) => us.id === id)!;
    try {
      await api.put(`/api/v2/users/${id}`, { status: next });
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
    } catch (err: any) {
      toast.error("Gagal mengubah status user", { description: err.message });
    } finally {
      setConfirmUserToggle(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle={`${regularUsers.length} registered users`} />

      {loading && (
        <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
           Loading users...
        </div>
      )}

      {!loading && <>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard label="Total Users" value={String(regularUsers.length)} icon={<Users size={16} />} />
        <StatCard
          label="Active"
          value={String(regularUsers.filter((u) => u.status === "active").length)}
          icon={<UserCheck size={16} />}
          trend="up"
        />
        <StatCard
          label="Suspended"
          value={String(regularUsers.filter((u) => u.status === "suspended").length)}
          icon={<UserX size={16} />}
          trend={regularUsers.filter((u) => u.status === "suspended").length > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {["User", "Risk Profile", "Joined", "Portfolio Value", "Status", "Actions"].map((h) => (
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
            {regularUsers.map((u) => (
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
                <td
                  className="px-4 py-3 text-xs font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fmt(u.totalAssets || 0)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusBadge(u.status)}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
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
          </tbody>
        </table>
      </div>
      </>}
    </div>
  );
}
