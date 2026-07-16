import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, UserIcon, Shield } from "lucide-react";
import type { AppUser, View } from "~/types";
import { AuthShell } from '~/features/auth/components/AuthShell';
import { InputField } from '~/shared/components/Input';
import { Btn } from '~/shared/components/Button';
import { AuthApi } from '~/features/auth/api';
import { useAuthStore } from '~/features/auth/auth.store';

interface RegisterViewProps {
  onRegister: (user: AppUser) => void;
  onNavigate: (v: View) => void;
}

export function RegisterView({ onRegister, onNavigate }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pass.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pass !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await AuthApi.register({ name, email, password: pass });
      const { accessToken, refreshToken, user: authUser } = res.data;

      // Save to Zustand store
      useAuthStore.getState().setAuth(accessToken, refreshToken, authUser);

      // Trigger root App state update
      onRegister(authUser);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <Shield size={20} className="text-primary" />
          <span className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            WealthMS
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
          Create your account
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Start your wealth management journey</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <InputField
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Budi Santoso"
          icon={<UserIcon size={15} />}
          required
        />
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
              placeholder="Min. 8 characters"
              required
            />
            <Btn
              variant="unstyled"
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </Btn>
          </div>
        </div>
        <InputField
          label="Confirm password"
          type={showPass ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          icon={<Lock size={15} />}
          required
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle size={12} />
            {error}
          </p>
        )}
        <Btn type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Btn>
      </form>
      <p className="text-sm text-center text-muted-foreground mt-5">
        Already have an account?{" "}
        <Btn
          variant="unstyled"
          onClick={() => onNavigate("login")}
          className="font-medium hover:underline text-primary"
        >
          Sign in
        </Btn>
      </p>
    </AuthShell>
  );
}
