import { Btn } from "~/shared/components/Button";
import { useState } from "react";
import { Menu, Shield } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { AppUser } from "~/shared/types/common";

interface AppLayoutProps {
  children: React.ReactNode;
  user: AppUser;
  onLogout: () => void;
}

export function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar user={user} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex items-center justify-between h-16 px-4 bg-[#0d2137] border-b border-gray-800 md:hidden z-30 shrink-0">
          <Btn
            variant="unstyled"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Btn>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#b8860b" }}
            >
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-serif)" }}>
              WealthMS
            </span>
          </div>
          <span className="text-xs text-white/60 truncate max-w-[120px]">{user.name}</span>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
