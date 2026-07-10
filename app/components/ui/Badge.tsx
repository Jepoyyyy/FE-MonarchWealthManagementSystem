interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:     "bg-gray-900 text-white border-gray-900",
  secondary:   "bg-gray-100 text-gray-700 border-gray-200",
  destructive: "bg-red-100 text-red-700 border-red-200",
  outline:     "bg-transparent text-gray-700 border-gray-300",
};

export function Badge({ children, variant = "secondary", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
