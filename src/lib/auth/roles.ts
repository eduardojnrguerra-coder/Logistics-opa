export const ROLES = [
  "owner_admin",
  "operations_manager",
  "dispatcher",
  "driver",
  "finance",
  "maintenance_manager",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner_admin: "Owner/Admin",
  operations_manager: "Operations Manager",
  dispatcher: "Dispatcher",
  driver: "Driver",
  finance: "Finance",
  maintenance_manager: "Maintenance Manager",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// A staff population, not the driver/customer portal populations. Every
// permission group below is expressed as "which staff roles" — driver and
// customer access is scoped by ownership (their own jobs/invoices/etc, see
// the RLS policies in supabase/migrations/0002_rls_policies.sql), not by
// this permission matrix.
export const PERMISSIONS = {
  manageStaff: ["owner_admin"],
  manageCustomers: ["owner_admin", "operations_manager"],
  manageVehiclesDrivers: ["owner_admin", "operations_manager"],
  dispatchJobs: ["owner_admin", "operations_manager", "dispatcher"],
  manageFinance: ["owner_admin", "operations_manager", "finance"],
  manageMaintenance: ["owner_admin", "maintenance_manager"],
  manageAlerts: ["owner_admin", "operations_manager"],
  manageBusinessSettings: ["owner_admin"],
  manageTrackingProvider: ["owner_admin", "operations_manager"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
