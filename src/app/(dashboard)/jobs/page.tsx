import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listJobs } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

type Job = Awaited<ReturnType<typeof listJobs>>[number];

export default async function JobsPage() {
  const jobs = await listJobs();

  const columns: Column<Job>[] = [
    { header: "Customer", cell: (job) => job.customers?.name ?? "—" },
    { header: "Pickup", cell: (job) => job.pickup_address ?? "—" },
    { header: "Drop-off", cell: (job) => job.dropoff_address ?? "—" },
    { header: "Vehicle", cell: (job) => job.vehicles?.registration ?? "Unassigned" },
    { header: "Driver", cell: (job) => job.drivers?.name ?? "Unassigned" },
    {
      header: "Scheduled",
      cell: (job) => (job.scheduled_at ? formatDate(job.scheduled_at) : "—"),
    },
    { header: "Priority", cell: (job) => <StatusBadge status={job.priority} /> },
    { header: "Status", cell: (job) => <StatusBadge status={job.status} /> },
  ];

  return (
    <>
      <PageHeader title="Jobs" description={`${jobs.length} jobs across all customers.`} />
      <Card>
        <DataTable columns={columns} rows={jobs} getKey={(job) => job.id} emptyMessage="No jobs yet." />
      </Card>
    </>
  );
}
