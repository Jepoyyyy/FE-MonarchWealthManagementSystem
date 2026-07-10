import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50  text-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex items-center justify-between h-16 px-4 bg-gray-950 border-b border-gray-800  md:hidden z-30 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-900 "
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-base font-bold text-white ">
            Monarch WMS
          </span>
          {/* Spacer to align title center */}
          <div className="w-8" />
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
