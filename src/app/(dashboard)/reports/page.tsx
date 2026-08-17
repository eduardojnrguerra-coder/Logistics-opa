import { Card, PageHeader, StatCard } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { requirePermission } from "@/lib/auth/guards";
import { listInvoices, listJobs } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";

type RouteRow = { route: string; jobs: number; delayed: number; onTimeRate: number };

export default async function ReportsPage() {
  await requirePermission("manageFinance");
  const [jobs, invoices] = await Promise.all([listJobs(), listInvoices()]);

  const delivered = jobs.filter((job) => job.status === "Delivered");
  const delayed = jobs.filter((job) => job.status === "Delayed");
  const onTimeRate =
    delivered.length + delayed.length > 0
      ? Math.round((delivered.length / (delivered.length + delayed.length)) * 100)
      : 100;

  const collected = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  // Delivered work with no invoice attached is revenue that has been earned
  // but never billed — the gap worth surfacing to an owner.
  const invoicedJobIds = new Set(invoices.map((invoice) => invoice.job_id).filter(Boolean));
  const unbilled = delivered.filter((job) => !invoicedJobIds.has(job.id));

  const byRoute = jobs.reduce<Record<string, RouteRow>>((acc, job) => {
    const route = `${job.pickup_address ?? "—"} → ${job.dropoff_address ?? "—"}`;
    acc[route] ??= { route, jobs: 0, delayed: 0, onTimeRate: 100 };
    acc[route].jobs += 1;
    if (job.status === "Delayed") acc[route].delayed += 1;
    return acc;
  }, {});

  const routes = Object.values(byRoute)
    .map((row) => ({
      ...row,
      onTimeRate: Math.round(((row.jobs - row.delayed) / row.jobs) * 100),
    }))
    .sort((a, b) => b.jobs - a.jobs);

  const columns: Column<RouteRow>[] = [
    { header: "Route", cell: (row) => row.route },
    { header: "Jobs", align: "right", cell: (row) => row.jobs },
    { header: "Delayed", align: "right", cell: (row) => row.delayed },
    { header: "On time", align: "right", cell: (row) => `${row.onTimeRate}%` },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Delivery performance and revenue capture." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Delivered jobs" value={delivered.length} />
        <StatCard
          label="On-time rate"
          value={`${onTimeRate}%`}
          meta={`${delayed.length} delayed`}
          tone={onTimeRate >= 90 ? "positive" : "warning"}
        />
        <StatCard label="Collected" value={formatCurrency(collected)} tone="positive" />
        <StatCard
          label="Delivered, not invoiced"
          value={unbilled.length}
          meta="Earned but unbilled work"
          tone={unbilled.length > 0 ? "warning" : "positive"}
        />
      </div>

      <Card title="Route performance" subtitle="Ranked by volume">
        <DataTable
          columns={columns}
          rows={routes}
          getKey={(row) => row.route}
          emptyMessage="No route data yet."
        />
      </Card>
    </>
  );
}
