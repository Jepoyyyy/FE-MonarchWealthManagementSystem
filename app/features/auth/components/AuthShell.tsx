import React from "react";
import { Shield, TrendingUp, Layers } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="min-h-screen w-full flex"
      style={{
        background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 60%, #2a5080 100%)",
      }}
    >
      {/* Left Branding Side (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Shield size={18} className="text-white" />
          </div>
          <span
            className="text-white font-semibold text-lg"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            WealthMS
          </span>
        </div>
        <div>
          <h1
            className="text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Grow your wealth
            <br />
            with confidence.
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Personalized investment recommendations tailored to your risk profile across deposits, bonds, mutual funds, and equities.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: Shield, label: "Risk-profiled recommendations" },
              { icon: TrendingUp, label: "Portfolio progress tracking" },
              { icon: Layers, label: "Diversified product selection" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(184,134,11,0.2)" }}
                >
                  <Icon size={14} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-blue-100 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-xs">© 2024 WealthMS · JWT-secured · All transactions simulated</p>
      </div>

      {/* Right Content Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
