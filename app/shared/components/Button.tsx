interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent" | "unstyled";
  size?: "sm" | "md" | "lg" | "none";
}

const variantClasses: Record<NonNullable<BtnProps["variant"]>, string> = {
  primary:   "bg-gray-900 text-white hover:bg-gray-700",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost:     "bg-transparent text-gray-700 hover:bg-gray-100",
  danger:    "bg-red-600 text-white hover:bg-red-500",
  accent:    "bg-amber-600 text-white hover:bg-amber-500",
  unstyled:  "bg-transparent text-current border-0 p-0 shadow-none hover:bg-transparent",
};

const sizeClasses: Record<NonNullable<BtnProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  none: "",
};

export function Btn({ children, variant = "primary", size = "md", className = "", ...props }: BtnProps) {
  const baseClasses = variant === "unstyled" 
    ? "" 
    : "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const actualSize = variant === "unstyled" ? "none" : size;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[actualSize]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { Btn as Button };
