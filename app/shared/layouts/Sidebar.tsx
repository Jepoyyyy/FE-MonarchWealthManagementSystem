import { NavLink } from "react-router";
import {
  LogOut,
  X,
  Shield,
  Home,
  Layers,
  Briefcase,
  Target,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
} from "lucide-react";
import type { AppUser } from "~/shared/types/common";
import { Btn } from "~/shared/components/Button";
import { RiskBadge } from '~/features/profile/components/RiskBadge';

interface SidebarProps {
  user: AppUser;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems =
    user.role === "admin"
      ? [
          { name: "Overview", href: "/admin", icon: BarChart3, end: true },
          { name: "Products", href: "/admin/products", icon: Layers },
          { name: "Users", href: "/admin/users", icon: Users },
          { name: "Audit Trail", href: "/admin/audit", icon: FileText },
        ]
      : [
          { name: "Dashboard", href: "/", icon: Home, end: true },
          { name: "Products", href: "/products", icon: Layers },
          { name: "Assets", href: "/assets", icon: Briefcase },
          { name: "Goals", href: "/goals", icon: Target },
          { name: "Recommendations", href: "/recommendations", icon: Star },
          { name: "Progress", href: "/progress", icon: TrendingUp },
        ];

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0d2137] border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 md:static md:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#b8860b" }}
            >
              <Shield size={16} className="text-white" />
            </div>
            <span
              className="text-white font-semibold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              WealthMS
            </span>
          </div>
          {onClose && (
            <Btn
              variant="unstyled"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-800 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-300" />
            </Btn>
          )}
        </div>

        {/* Administrator badge / Risk Profile badge */}
        {user.role === "admin" ? (
          <div
            className="mx-4 mt-4 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ background: "rgba(184,134,11,0.2)", color: "#b8860b" }}
          >
            Administrator
          </div>
        ) : (
          user.riskProfile && (
            <div className="mx-4 mt-4 px-3 py-2 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.05)" }}>
              <span className="text-gray-400">Risk Profile</span>
              <div className="mt-1">
                <RiskBadge profile={user.riskProfile} showDot />
              </div>
            </div>
          )
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive ? "bg-[rgba(255,255,255,0.1)] text-white" : "text-gray-300 hover:bg-gray-700"
                  }`
                }
                style={({ isActive }) => ({
                  borderLeft: isActive ? `3px solid #b8860b` : "3px solid transparent",
                })}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile / footer section */}
        <div className="p-4 border-t border-gray-800 bg-[#0d2137]">
          <div className="flex items-center gap-3 px-2 py-1 mb-4">
            <div className="h-9 w-9 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-semibold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Btn
            variant="unstyled"
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </Btn>
        </div>
      </aside>
    </>
  );
}
