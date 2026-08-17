"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Radar,
  Settings,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { NavIcon, NavItem } from "@/components/shell/nav";

const ICONS: Record<NavIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  tracking: Radar,
  jobs: Package,
  vehicles: Truck,
  drivers: Users,
  customers: Building2,
  quotes: FileText,
  invoices: DollarSign,
  maintenance: Wrench,
  reports: BarChart3,
  settings: Settings,
};

export function Sidebar({ items, businessName }: { items: NavItem[]; businessName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="fixed top-3 left-3 z-50 rounded-md border border-neutral-200 bg-white p-2 lg:hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-neutral-200 bg-white transition-transform lg:translate-x-0 dark:border-neutral-800 dark:bg-neutral-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-neutral-200 px-5 dark:border-neutral-800">
          <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {businessName}
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
                }`}
              >
                <Icon size={17} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
