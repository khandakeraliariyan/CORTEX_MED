import {
  CalendarClock,
  LayoutDashboard,
  ListOrdered,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { ROUTES } from "@/constants/routes";

export const RECEPTION_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.RECEPTION.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Live queue",
    href: ROUTES.RECEPTION.QUEUE,
    icon: ListOrdered,
  },
  {
    label: "Patients",
    href: ROUTES.RECEPTION.PATIENTS,
    icon: Users,
  },
  {
    label: "Appointments",
    href: ROUTES.RECEPTION.APPOINTMENTS,
    icon: CalendarClock,
  },
];
