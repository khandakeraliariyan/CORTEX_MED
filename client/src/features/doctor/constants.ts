import {
  CalendarClock,
  LayoutDashboard,
  ListOrdered,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/layout/sidebar-nav";
import { ROUTES } from "@/constants/routes";

export const DOCTOR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DOCTOR.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Queue",
    href: ROUTES.DOCTOR.QUEUE,
    icon: ListOrdered,
  },
  {
    label: "Patients",
    href: ROUTES.DOCTOR.PATIENTS,
    icon: Users,
  },
  {
    label: "Appointments",
    href: ROUTES.DOCTOR.APPOINTMENTS,
    icon: CalendarClock,
  },
];
