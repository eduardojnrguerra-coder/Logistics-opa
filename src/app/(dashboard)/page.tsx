import { AlertTriangle, CircleDollarSign, Package, Truck, Users, Wrench } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDashboardSummary, listActiveJobs, listAlerts } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";

type ActiveJob = Awaited<ReturnType<typeof listActiveJobs>>[number];
type Alert = Awaited<ReturnType<typeof listAlerts>>[number];

export default async function DashboardPage() {
  const [summary, activeJobs, alerts] = await Promise.all([
    getDashboardSummary(),
    listActiveJobs(),
    listAlerts(),
  ]);

  const jobColumns: Column<ActiveJob>[] = [
    { header: "Customer", cell: (job) => job.customers?.name ?? "—" },
    { header: "Destination", cell: (job) => job.dropoff_address ?? "—" },
    { header: "Vehicle", cell: (job) => job.vehicles?.registration ?? "Unassigned" },
    { header: "Driver", cell: (job) => job.drivers?.name ?? "Unassigned" },
    { header: "Priority", cell: (job) => <StatusBadge status={job.priority} /> },
    { header: "Status", cell: (job) => <StatusBadge status={job.status} /> },
  ];

  const alertColumns: Column<Alert>[] = [
    { header: "Vehicle", cell: (alert) => alert.vehicles?.registration ?? "—" },
    { header: "Alert", cell: (alert) => alert.type },
    {
      header: "Detail",
      cell: (alert) => (
        <span className="text-neutral-500 dark:text-neutral-400">{alert.message}</span>
      ),
    },
    { header: "Severity", cell: (alert) => <StatusBadge status={alert.severity} /> },
  ];

  return (
    <>
      <PageHeader
        title="Operations overview"
        description="Live position of jobs, fleet, and cash across the business."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active jobs"
          value={summary.activeJobs}
          meta={`${summary.delayedJobs} delayed`}
          icon={Package}
          href="/jobs"
          tone={summary.delayedJobs > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Fleet available"
          value={`${summary.vehiclesTotal - summary.vehiclesOffRoad}/${summary.vehiclesTotal}`}
          meta={`${summary.vehiclesOffRoad} in maintenance or offline`}
          icon={Truck}
          href="/vehicles"
          tone={summary.vehiclesOffRoad > 0 ? "warning" : "positive"}
        />
        <StatCard
          label="Drivers on duty"
          value={summary.driversOnDuty}
          icon={Users}
          href="/drivers"
        />
        <StatCard
          label="Outstanding invoices"
          value={formatCurrency(summary.outstandingValue)}
          meta="Unpaid and issued"
          icon={CircleDollarSign}
          href="/invoices"
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(summary.overdueValue)}
          meta={`${summary.overdueCount} invoice${summary.overdueCount === 1 ? "" : "s"} past due`}
          icon={AlertTriangle}
          href="/invoices"
          tone={summary.overdueValue > 0 ? "danger" : "positive"}
        />
        <StatCard
          label="Open alerts"
          value={summary.openAlerts}
          meta="Unresolved fleet exceptions"
          icon={Wrench}
          href="/maintenance"
          tone={summary.openAlerts > 0 ? "warning" : "positive"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Jobs in progress"
          subtitle="Work currently moving through the fleet"
          className="xl:col-span-2"
        >
          <DataTable
            columns={jobColumns}
            rows={activeJobs}
            getKey={(job) => job.id}
            emptyMessage="No jobs are in progress right now."
          />
        </Card>

        <Card title="Fleet exceptions" subtitle="Unresolved alerts needing action">
          <DataTable
            columns={alertColumns}
            rows={alerts}
            getKey={(alert) => alert.id}
            emptyMessage="No open alerts."
          />
        </Card>
      </div>
    </>
  );
}
