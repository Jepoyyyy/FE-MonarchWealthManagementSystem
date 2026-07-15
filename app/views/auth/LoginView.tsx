import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import type { AppUser, View } from "~/types";
import { AuthShell } from "~/components/ui/AuthShell";
import { InputField } from "~/components/ui/InputField";
import { Btn } from "~/components/ui/Btn";
import { Shield } from "lucide-react";
import { AuthApi } from "~/api/auth";
import { useAuthStore } from "~/stores/authStore";

interface LoginViewProps {
  onLogin: (u: AppUser) => void;
  onNavigate: (v: View) => void;
}

export function LoginView({ onLogin, onNavigate }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await AuthApi.login({ email, password: pass });
      const { accessToken, refreshToken, user: authUser } = res.data;

      // Save to Zustand store
      useAuthStore.getState().setAuth(accessToken, refreshToken, authUser);
      
      // Trigger root App state update to switch views
      onLogin(authUser);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Your account has been suspended. Contact support.");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <Shield size={20} className="text-primary" />
          <span className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            WealthMS
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
          Welcome back
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail size={15} />}
          required
        />
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center">
              <Lock size={15} />
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
              style={{
                borderColor: "var(--border)",
                background: "var(--input-background)",
                color: "var(--foreground)",
              }}
              placeholder="Enter your password"
              required
            />
            <Btn
              variant="unstyled"
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </Btn>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle size={12} />
            {error}
          </p>
        )}
        <Btn type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Btn>
      </form>
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Btn
            variant="unstyled"
            onClick={() => onNavigate("register")}
            className="font-medium hover:underline text-primary"
          >
            Create one
          </Btn>
        </p>
        <div className="mt-4 p-3 rounded-lg text-xs text-muted-foreground" style={{ background: "var(--muted)" }}>
          <p className="font-medium mb-1">Demo accounts:</p>
          <p>Admin: admin@wms.id / Admin123!</p>
          <p>User: budi@example.com / User123!</p>
        </div>
      </div>
    </AuthShell>
  );
}
