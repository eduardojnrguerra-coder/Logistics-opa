import { PortalShell } from "@/components/shell/PortalShell";
import { Card, PageHeader, StatCard } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireDriver } from "@/lib/auth/guards";
import { ACTIVE_JOB_STATUSES, listMyDriverJobs } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

type Job = Awaited<ReturnType<typeof listMyDriverJobs>>[number];

export default async function DriverPortalPage() {
  const driver = await requireDriver();
  // No driver_id filter is passed anywhere below — RLS scopes these rows to
  // the signed-in driver, so this page cannot show another driver's work
  // even if the query were wrong.
  const jobs = await listMyDriverJobs();

  const active = jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status));
  const delivered = jobs.filter((job) => job.status === "Delivered");

  const columns: Column<Job>[] = [
    { header: "Customer", cell: (job) => job.customers?.name ?? "—" },
    { header: "Pickup", cell: (job) => job.pickup_address ?? "—" },
    { header: "Drop-off", cell: (job) => job.dropoff_address ?? "—" },
    { header: "Vehicle", cell: (job) => job.vehicles?.registration ?? "—" },
    {
      header: "Scheduled",
      cell: (job) => (job.scheduled_at ? formatDate(job.scheduled_at) : "—"),
    },
    { header: "Status", cell: (job) => <StatusBadge status={job.status} /> },
  ];

  return (
    <PortalShell name={driver.fullName} context="Driver">
      <PageHeader title="My jobs" description="Work assigned to you." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned to me" value={jobs.length} />
        <StatCard label="In progress" value={active.length} tone={active.length > 0 ? "warning" : "default"} />
        <StatCard label="Delivered" value={delivered.length} tone="positive" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={jobs}
          getKey={(job) => job.id}
          emptyMessage="You have no assigned jobs."
        />
      </Card>
    </PortalShell>
  );
}
