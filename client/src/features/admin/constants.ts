import { BarChart3, LayoutDashboard, Users } from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { ROUTES } from "@/constants/routes";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: ROUTES.ADMIN.ANALYTICS,
    icon: BarChart3,
  },
  {
    label: "Staff",
    href: ROUTES.ADMIN.STAFF,
    icon: Users,
  },
];
