"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { ROUTES } from "@/constants/routes";

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) markAllRead();
        }}
        className="relative"
      >
        ♙
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-3 w-80 rounded-xl border border-[#c4c9dc] bg-white text-left text-sm shadow-lg">
            <div className="border-b border-[#d7dbea] px-4 py-3 font-black">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-slate-500">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border-b border-[#eef0fb] px-4 py-3">
                    <p className="text-slate-800">{notification.message}</p>
                    <span className="text-xs text-slate-500">{timeAgo(notification.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "[]" },
  { label: "Appointments", href: "/reception/appointments", icon: "##" },
  { label: "Doctors", href: "/admin/staff", icon: "++" },
  { label: "Queue", href: "/reception/queue", icon: "::" },
  { label: "Analytics", href: "/admin/analytics", icon: "||" },
  { label: "Settings", href: "/admin/settings", icon: "**" },
];

const doctorNav: NavItem[] = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: "[]" },
  { label: "My Queue", href: "/doctor/queue", icon: "::" },
  { label: "Patients", href: "/doctor/patients", icon: "++" },
  { label: "History", href: "/doctor/appointments", icon: "||" },
];

const receptionNav: NavItem[] = [
  { label: "Dashboard", href: "/reception/dashboard", icon: "▦" },
  { label: "Appointments", href: "/reception/appointments", icon: "▤" },
  { label: "Doctors", href: "/reception/doctors", icon: "▣" },
  { label: "Queue", href: "/reception/queue", icon: "◉" },
  { label: "Analytics", href: "/reception/dashboard", icon: "▥" },
  { label: "Settings", href: "#", icon: "⚙" },
];

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      {!compact && (
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#2563eb] text-sm font-black text-white shadow-sm">
          ▣
        </span>
      )}
      <span>
        <span className="block text-2xl font-black leading-none text-[#004bd1]">
          CortexMed
        </span>
        {!compact && (
          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
            Smart Hospital
          </span>
        )}
      </span>
    </Link>
  );
}

export function Avatar({ name, className = "" }: { name?: string; className?: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div className={`grid place-items-center rounded-full border-2 border-[#0b55d9] bg-gradient-to-br from-sky-100 to-slate-300 text-xs font-bold text-[#0b55d9] ${className}`}>
      {initials}
    </div>
  );
}

export type DashboardRole = "admin" | "doctor" | "receptionist";

function sidebarNavFor(role: DashboardRole) {
  if (role === "doctor") return doctorNav;
  if (role === "receptionist") return receptionNav;
  return adminNav;
}

const roleLabel: Record<DashboardRole, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  receptionist: "Front Desk",
};

export function DashboardShell({
  role,
  active,
  searchPlaceholder = "Search medical records...",
  children,
}: {
  role: DashboardRole;
  active: string;
  searchPlaceholder?: string;
  children: ReactNode;
}) {
  const nav = sidebarNavFor(role);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const displayName = user?.name ?? "Guest User";
  const displayRole = user ? roleLabel[user.role] : roleLabel[role];

  const handleLogout = () => {
    clearSession();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[276px] border-r border-[#c9cde0] bg-[#f1f3ff] lg:flex lg:flex-col">
        <div className="flex h-[92px] items-center px-8">
          <AppLogo />
        </div>
        <nav className="flex-1 space-y-3 px-4 pt-6">
          {nav.map((item) => {
            const selected = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-12 items-center gap-4 rounded-lg px-5 text-[15px] font-medium transition ${
                  selected
                    ? "bg-[#3269ea] text-white shadow-sm"
                    : "text-slate-800 hover:bg-white"
                }`}
              >
                <span className="grid h-6 w-6 place-items-center text-lg font-black">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="mb-4 border-t border-[#c4c9dc]" />
          {role !== "doctor" && (
            <Link
              href="/reception/dashboard#book-appointment"
              className="mb-5 flex h-14 items-center justify-center gap-3 rounded-lg bg-[#0755d9] px-5 text-base font-bold text-white shadow-sm"
            >
              <span className="text-2xl leading-none">+</span> Book Appointment
            </Link>
          )}
          {role === "doctor" && (
            <Link href="/doctor/intake" className="mb-5 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#0755d9] px-5 text-base font-bold text-white">
              <span className="text-2xl leading-none">+</span> Emergency Intake
            </Link>
          )}
          <div className="space-y-3 text-slate-700">
            <Link href="#" className="flex h-10 items-center gap-4 px-4">? Help Center</Link>
            <button onClick={handleLogout} className="flex h-10 w-full items-center gap-4 px-4 text-left text-red-600">↪ Logout</button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-[#c4c9dc] bg-[#fbfaff]/95 backdrop-blur lg:ml-[276px]">
        <div className="flex h-[64px] items-center gap-5 px-5 lg:px-8">
          <div className="lg:hidden">
            <AppLogo compact />
          </div>
          <div className="relative hidden w-full max-w-[430px] sm:block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
            <input
              className="h-10 w-full rounded-full border border-transparent bg-[#f1f2fb] pl-12 pr-4 outline-none"
              placeholder={searchPlaceholder}
            />
          </div>
          <div className="ml-auto flex items-center gap-5 text-xl text-slate-900">
            <NotificationBell />
            <span className="h-8 w-px bg-[#c4c9dc]" />
            <div className="hidden text-right text-sm sm:block">
              <div className="font-bold text-slate-950">{displayName}</div>
              <div className="text-xs uppercase tracking-wide text-slate-600">{displayRole}</div>
            </div>
            <Avatar name={displayName} className="h-10 w-10" />
          </div>
        </div>
      </header>

      <main className="lg:ml-[280px]">
        <div className="mx-auto max-w-[1260px] px-5 py-8 lg:px-8">{children}</div>
        <Footer />
      </main>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#c4c9dc] bg-[#dfe3ef] px-5 py-7 lg:px-9">
      <div className="mx-auto flex max-w-[1260px] flex-col gap-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-black text-[#004bd1]">CortexMed</div>
          <div>© {new Date().getFullYear()} CortexMed AI Hospital Systems. All rights reserved.</div>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Compliance</Link>
          <Link href="#">Security</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-normal text-slate-950">{title}</h1>
        {subtitle && <p className="mt-2 text-lg text-slate-700">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  const styles = {
    primary: "bg-[#0755d9] text-white border-[#0755d9]",
    secondary: "bg-white text-slate-950 border-[#c4c9dc]",
    danger: "bg-[#c91414] text-white border-[#c91414]",
  };
  return (
    <button type={type} className={`h-12 rounded-lg border px-6 text-sm font-bold shadow-sm ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  action,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-[#c4c9dc] bg-white shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[#d7dbea] px-6 py-5">
          <div>
            {title && <h2 className="text-2xl font-black">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-700">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#c4c9dc] p-9 text-center italic text-slate-500">
      {label}
    </div>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  delta,
  tone = "blue",
}: {
  icon: string;
  label: string;
  value: string;
  delta?: string;
  tone?: "blue" | "green" | "red" | "orange" | "slate";
}) {
  const tones = {
    blue: "bg-blue-100 text-[#0755d9]",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-xl border border-[#c4c9dc] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-lg text-lg font-black ${tones[tone]}`}>
          {icon}
        </span>
        {delta && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>
            {delta}
          </span>
        )}
      </div>
      <div className="mt-5 text-base text-slate-800">{label}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "red" | "orange" | "slate";
}) {
  const tones = {
    blue: "bg-blue-100 text-[#0755d9]",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    slate: "bg-slate-200 text-slate-700",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
}

export function Progress({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "red" | "orange" }) {
  const colors = {
    blue: "bg-[#0755d9]",
    green: "bg-emerald-700",
    red: "bg-red-600",
    orange: "bg-orange-700",
  };
  return (
    <div className="h-2 rounded-full bg-[#e7e9f5]">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function BarChart({ values, stacked = false }: { values?: number[]; stacked?: boolean }) {
  if (!values || values.length === 0) {
    return (
      <div className="grid h-56 place-items-center rounded-lg border border-dashed border-[#c4c9dc] text-sm italic text-slate-500">
        No data available yet
      </div>
    );
  }
  return (
    <div className="flex h-56 items-end gap-3">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col justify-end">
          <div className="rounded-t-lg bg-blue-200" style={{ height: `${Math.max(4, value)}%` }}>
            {stacked && <div className="rounded-t-lg bg-[#0755d9]" style={{ height: "62%" }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

const HEATMAP_RAMP = ["#eef0fb", "#8fb0ee", "#6f95e8", "#3f6cd6", "#0b3fa8"];

function heatCellColor(value: number, max: number): string {
  if (value <= 0 || max <= 0) return HEATMAP_RAMP[0];
  const step = Math.min(3, Math.ceil((value / max) * 4) - 1);
  return HEATMAP_RAMP[1 + Math.max(0, step)];
}

export function HeatMap({
  rowLabels,
  columnLabels,
  data,
}: {
  rowLabels?: string[];
  columnLabels?: string[];
  data?: number[][];
}) {
  if (!data || data.length === 0 || data.every((row) => row.every((value) => value === 0))) {
    const rows = rowLabels?.length ?? 7;
    const columns = columnLabels?.length ?? 12;
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-1" style={{ gridTemplateColumns: `36px repeat(${columns}, minmax(0, 1fr))` }}>
            <span className="text-sm text-slate-400">{rowLabels?.[row] ?? "--"}</span>
            {Array.from({ length: columns }).map((_, index) => (
              <span key={`${row}-${index}`} className="h-7 rounded border border-[#d7dbea] bg-[#eef0fb]" />
            ))}
          </div>
        ))}
        <p className="pt-2 text-center text-sm italic text-slate-500">No activity data available yet</p>
      </div>
    );
  }

  const max = Math.max(...data.flat(), 1);

  return (
    <div className="space-y-2">
      {data.map((row, rowIndex) => (
        <div key={rowIndex} className="grid gap-1" style={{ gridTemplateColumns: `36px repeat(${row.length}, minmax(0, 1fr))` }}>
          <span className="text-sm text-slate-500">{rowLabels?.[rowIndex] ?? rowIndex}</span>
          {row.map((value, colIndex) => (
            <span
              key={`${rowIndex}-${colIndex}`}
              title={`${columnLabels?.[colIndex] ?? colIndex}: ${value} appointment${value === 1 ? "" : "s"}`}
              className="h-7 rounded border border-[#d7dbea]"
              style={{ backgroundColor: heatCellColor(value, max) }}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center justify-end gap-2 pt-2 text-xs text-slate-500">
        <span>Fewer</span>
        {HEATMAP_RAMP.map((color) => (
          <span key={color} className="h-3 w-5 rounded-sm border border-[#d7dbea]" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export function Donut({ label = "Cases", total = "--" }: { label?: string; total?: string }) {
  return (
    <div className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-[#eef0fb]">
      <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
        <div>
          <div className="text-3xl font-black">{total}</div>
          <div className="text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function HeroIllustration() {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-[#d7dbea] bg-gradient-to-br from-sky-100 via-white to-cyan-100 p-6">
      <div className="absolute inset-x-8 top-9 h-28 rounded-xl border border-cyan-200 bg-white/80 shadow-sm" />
      <div className="absolute left-16 top-20 h-24 w-14 rounded-t-full bg-white shadow" />
      <div className="absolute left-20 top-12 h-10 w-10 rounded-full bg-cyan-200" />
      <div className="absolute right-16 top-24 h-24 w-20 rounded-lg bg-[#0755d9]/15" />
      <div className="absolute right-28 top-50 h-10 w-28 rounded-full bg-[#0755d9]" />
      <div className="absolute bottom-8 left-1/2 h-20 w-48 -translate-x-1/2 rounded-xl bg-[#0755d9] p-4 text-white shadow-lg">
        <div className="h-2 w-24 rounded bg-white/80" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <span className="h-8 rounded bg-white/25" />
          <span className="h-8 rounded bg-emerald-300/80" />
          <span className="h-8 rounded bg-white/25" />
        </div>
      </div>
    </div>
  );
}
