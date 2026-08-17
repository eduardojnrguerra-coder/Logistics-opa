import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requirePermission } from "@/lib/auth/guards";
import { ROLE_LABELS, isRole } from "@/lib/auth/roles";
import { publicConfig } from "@/lib/config.client";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  await requirePermission("manageBusinessSettings");

  const supabase = await createClient();
  const [{ data: settings }, { data: staff }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("profiles").select("id, full_name, email, role, active").order("full_name"),
  ]);

  type Staff = NonNullable<typeof staff>[number];

  const columns: Column<Staff>[] = [
    {
      header: "Name",
      cell: (member) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{member.full_name}</span>
      ),
    },
    { header: "Email", cell: (member) => member.email },
    {
      header: "Role",
      cell: (member) => (isRole(member.role) ? ROLE_LABELS[member.role] : member.role),
    },
    {
      header: "Status",
      cell: (member) => <StatusBadge status={member.active ? "Active" : "On Hold"} />,
    },
  ];

  const businessRows = [
    ["Business name", settings?.business_name ?? publicConfig.NEXT_PUBLIC_BUSINESS_NAME],
    ["Currency", settings?.currency_code ?? publicConfig.NEXT_PUBLIC_CURRENCY_CODE],
    ["Locale", settings?.locale ?? publicConfig.NEXT_PUBLIC_LOCALE],
    ["Contact email", settings?.contact_email ?? "Not set"],
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Business profile and staff access. Only an Owner/Admin can view this page."
      />

      <div className="space-y-6">
        <Card
          title="Business profile"
          subtitle="Seeded from environment variables on first run, editable here per deployment"
        >
          <dl className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {businessRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Staff and roles" subtitle="Role determines what each person can reach">
          <DataTable
            columns={columns}
            rows={staff ?? []}
            getKey={(member) => member.id}
            emptyMessage="No staff accounts yet."
          />
        </Card>
      </div>
    </>
  );
}
