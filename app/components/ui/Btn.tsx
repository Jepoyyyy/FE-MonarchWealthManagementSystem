interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<BtnProps["variant"]>, string> = {
  primary:   "bg-gray-900 text-white hover:bg-gray-700",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost:     "bg-transparent text-gray-700 hover:bg-gray-100",
  danger:    "bg-red-600 text-white hover:bg-red-500",
  accent:    "bg-amber-600 text-white hover:bg-amber-500",
};

const sizeClasses: Record<NonNullable<BtnProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Btn({ children, variant = "primary", size = "md", className = "", ...props }: BtnProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
