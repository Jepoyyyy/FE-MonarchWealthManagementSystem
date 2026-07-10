import { NavLink } from "react-router";
import { LogOut, X, Shield } from "lucide-react";
import { navigationItems } from "~/config/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0d2137] border-r border-gray-200  transform transition-transform duration-300 md:translate-x-0 md:static md:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-12   border-b border-gray-200 ">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#b8860b" }}>
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold" style={{ fontFamily: "var(--font-serif)" }}>WealthMS</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100  md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-[rgba(255,255,255,0.1)] text-white"
                      : "text-gray-300 hover:bg-gray-700"
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
        <div className="p-4 border-t border-gray-200 bg-[#0d2137]">
          <div className="flex items-center gap-3 px-2 py-1 mb-4">
            <div className="h-9 w-9 rounded-full bg-[#0d2137] flex items-center justify-center text-blue-700 font-semibold">
              DU
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Demo User
              </p>
              <p className="text-xs text-gray-500 truncate">
                demo@monarch.com
              </p>
            </div>
          </div>
          <button
            onClick={() => console.log("Logout triggered")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
