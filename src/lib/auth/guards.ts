import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRole, roleHasPermission, type Permission, type Role } from "@/lib/auth/roles";

export type StaffProfile = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  driverId: string | null;
  active: boolean;
};

export type CustomerUser = {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
};

// Returns the signed-in staff profile, or null if there is no session or
// the session belongs to a driver/customer portal user instead of staff.
export async function getStaffProfile(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, driver_id, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !isRole(profile.role)) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    driverId: profile.driver_id,
    active: profile.active,
  };
}

export async function getCustomerUser(): Promise<CustomerUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: customerUser } = await supabase
    .from("customer_users")
    .select("id, customer_id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!customerUser) return null;

  return {
    id: customerUser.id,
    customerId: customerUser.customer_id,
    fullName: customerUser.full_name,
    email: customerUser.email,
  };
}

// Where a signed-in user belongs. Staff land on the ops dashboard, drivers
// and customers on their own portal. An authenticated user with neither a
// profile nor a customer_users row is orphaned — invited in auth but never
// provisioned — and goes to /unauthorized rather than bouncing between "/"
// and "/login" forever.
export async function resolveHomePath(): Promise<string> {
  const profile = await getStaffProfile();
  if (profile?.active) return profile.role === "driver" ? "/driver" : "/";

  const customerUser = await getCustomerUser();
  if (customerUser) return "/portal";

  return "/unauthorized";
}

// For use at the top of a staff (dashboard) server component or server
// action. Redirects to /login if unauthenticated, and to /unauthorized if
// authenticated but lacking one of the allowed roles. RLS is the real
// enforcement boundary (see 0002_rls_policies.sql) — this is the
// UI/route-level check that keeps unauthorized users from even seeing a
// page shell they have no data access to.
export async function requireRole(allowed: readonly Role[]): Promise<StaffProfile> {
  const profile = await getStaffProfile();
  if (!profile) redirect("/login");
  if (!profile.active || !allowed.includes(profile.role)) redirect("/unauthorized");
  return profile;
}

export async function requirePermission(permission: Permission): Promise<StaffProfile> {
  const profile = await getStaffProfile();
  if (!profile) redirect("/login");
  if (!profile.active || !roleHasPermission(profile.role, permission)) redirect("/unauthorized");
  return profile;
}

// For use at the top of a (portal)/driver page/layout.
export async function requireDriver(): Promise<StaffProfile & { driverId: string }> {
  const profile = await getStaffProfile();
  if (!profile) redirect("/login");
  if (!profile.active || profile.role !== "driver" || !profile.driverId) redirect("/unauthorized");
  return { ...profile, driverId: profile.driverId };
}

// For use at the top of a (portal)/customer page/layout.
export async function requireCustomer(): Promise<CustomerUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customerUser = await getCustomerUser();
  // Signed in, but as staff or a driver rather than a customer contact.
  if (!customerUser) redirect("/unauthorized");
  return customerUser;
}
