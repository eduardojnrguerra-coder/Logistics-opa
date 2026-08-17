import { Header } from "@/components/shell/Header";
import { Sidebar } from "@/components/shell/Sidebar";
import { navItemsForPermissions } from "@/components/shell/nav";
import { getStaffProfile, resolveHomePath } from "@/lib/auth/guards";
import { PERMISSIONS, roleHasPermission, type Permission } from "@/lib/auth/roles";
import { publicConfig } from "@/lib/config.client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getStaffProfile();

  // Customers have no staff profile, and drivers have one but belong in the
  // portal rather than the ops app. resolveHomePath sends each to the right
  // place without ever bouncing back here.
  if (!profile || !profile.active) redirect(await resolveHomePath());
  if (profile.role === "driver") redirect("/driver");

  const granted = (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    roleHasPermission(profile.role, permission),
  );
  const items = navItemsForPermissions(granted);

  return (
    <div className="min-h-svh bg-neutral-50 dark:bg-neutral-950">
      <Sidebar items={items} businessName={publicConfig.NEXT_PUBLIC_BUSINESS_NAME} />
      <div className="lg:pl-60">
        <Header fullName={profile.fullName} role={profile.role} />
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
