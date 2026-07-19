import {
  LayoutDashboard,
  Package,
  Wallet,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, end: true },
  { name: "Products", href: "/products", icon: Package },
  { name: "Assets", href: "/assets", icon: Wallet },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export const adminNavigationItems: NavigationItem[] = [
  { name: "Overview",  href: "/admin",          icon: LayoutDashboard, end: true },
  { name: "Users",     href: "/admin/users",    icon: Users },
  { name: "Products",  href: "/admin/products", icon: Package },
  { name: "Audit Log", href: "/admin/audit",    icon: ClipboardList },
];
