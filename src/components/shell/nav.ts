import type { Permission } from "@/lib/auth/roles";

// Server-safe: this module has no "use client", so the dashboard layout can
// filter the nav before rendering. Icons are referenced by name rather than
// by component, because a component reference cannot be serialised across
// the server/client boundary — Sidebar maps the id back to a lucide icon.
export type NavIcon =
  | "dashboard"
  | "tracking"
  | "jobs"
  | "vehicles"
  | "drivers"
  | "customers"
  | "quotes"
  | "invoices"
  | "maintenance"
  | "reports"
  | "settings";

export type NavItem = {
  name: string;
  href: string;
  icon: NavIcon;
  permission?: Permission;
};

// Items without a permission are visible to every staff role. The rest are
// filtered server-side, so a role never renders a link to a page its RLS
// policies would refuse to populate.
export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Live tracking", href: "/tracking", icon: "tracking" },
  { name: "Jobs", href: "/jobs", icon: "jobs" },
  { name: "Vehicles", href: "/vehicles", icon: "vehicles" },
  { name: "Drivers", href: "/drivers", icon: "drivers" },
  { name: "Customers", href: "/customers", icon: "customers", permission: "manageCustomers" },
  { name: "Quotes", href: "/quotes", icon: "quotes", permission: "manageFinance" },
  { name: "Invoices", href: "/invoices", icon: "invoices", permission: "manageFinance" },
  { name: "Maintenance", href: "/maintenance", icon: "maintenance" },
  { name: "Reports", href: "/reports", icon: "reports", permission: "manageFinance" },
  { name: "Settings", href: "/settings", icon: "settings", permission: "manageBusinessSettings" },
];

export function navItemsForPermissions(granted: Permission[]): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.permission || granted.includes(item.permission));
}
