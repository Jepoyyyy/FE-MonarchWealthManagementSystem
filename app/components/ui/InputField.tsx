import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function InputField({
  label,
  error,
  icon,
  rightElement,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          className={`w-full ${icon ? "pl-10" : "px-3"} ${rightElement ? "pr-28" : "pr-3"} py-2.5 rounded-md border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary border-border ${className}`}
          style={{ background: "var(--input-background)", color: "var(--foreground)" }}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground select-none">
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
