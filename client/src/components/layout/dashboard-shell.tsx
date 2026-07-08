"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { ROUTES } from "@/constants/routes";

interface DashboardShellProps {
  navItems: NavItem[];
  brandHref?: string;
  children: ReactNode;
}

export function DashboardShell({
  navItems,
  brandHref = ROUTES.HOME,
  children,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const currentItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Link
          href={brandHref}
          className="flex items-center gap-2 px-4 py-4 text-lg font-semibold"
        >
          <Stethoscope className="size-6 text-primary" />
          CortexMed
        </Link>
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <Stethoscope className="size-5 text-primary" />
                  CortexMed
                </SheetTitle>
              </SheetHeader>
              <SidebarNav
                items={navItems}
                onNavigate={() => setIsMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <h1 className="flex-1 truncate text-base font-semibold sm:text-lg">
            {currentItem?.label ?? "Dashboard"}
          </h1>

          <UserMenu />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
