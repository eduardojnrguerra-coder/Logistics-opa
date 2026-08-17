import { PortalShell } from "@/components/shell/PortalShell";
import { Card, PageHeader, StatCard } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireCustomer } from "@/lib/auth/guards";
import { listMyCustomerInvoices, listMyCustomerJobs } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/format";

type Job = Awaited<ReturnType<typeof listMyCustomerJobs>>[number];
type Invoice = Awaited<ReturnType<typeof listMyCustomerInvoices>>[number];

export default async function CustomerPortalPage() {
  const customer = await requireCustomer();
  // As with the driver portal, no customer_id is passed: RLS resolves the
  // caller's own account, replacing the old dropdown that let anyone view
  // any customer's data.
  const [jobs, invoices] = await Promise.all([listMyCustomerJobs(), listMyCustomerInvoices()]);

  const outstanding = invoices
    .filter((invoice) => ["Sent", "Part Paid", "Overdue"].includes(invoice.status))
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const jobColumns: Column<Job>[] = [
    { header: "Pickup", cell: (job) => job.pickup_address ?? "—" },
    { header: "Drop-off", cell: (job) => job.dropoff_address ?? "—" },
    {
      header: "Scheduled",
      cell: (job) => (job.scheduled_at ? formatDate(job.scheduled_at) : "—"),
    },
    {
      header: "Delivered",
      cell: (job) => (job.delivered_at ? formatDate(job.delivered_at) : "—"),
    },
    { header: "Status", cell: (job) => <StatusBadge status={job.status} /> },
  ];

  const invoiceColumns: Column<Invoice>[] = [
    {
      header: "Amount",
      align: "right",
      cell: (invoice) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {formatCurrency(Number(invoice.amount))}
        </span>
      ),
    },
    { header: "Due", cell: (invoice) => (invoice.due_date ? formatDate(invoice.due_date) : "—") },
    { header: "Status", cell: (invoice) => <StatusBadge status={invoice.status} /> },
  ];

  return (
    <PortalShell name={customer.fullName} context="Customer portal">
      <PageHeader title="Your account" description="Deliveries and billing for your business." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total deliveries" value={jobs.length} />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          tone={outstanding > 0 ? "warning" : "positive"}
        />
        <StatCard label="Invoices" value={invoices.length} />
      </div>

      <div className="space-y-6">
        <Card title="Deliveries" subtitle="Jobs booked for your account">
          <DataTable
            columns={jobColumns}
            rows={jobs}
            getKey={(job) => job.id}
            emptyMessage="No deliveries yet."
          />
        </Card>

        <Card title="Invoices" subtitle="Your billing history">
          <DataTable
            columns={invoiceColumns}
            rows={invoices}
            getKey={(invoice) => invoice.id}
            emptyMessage="No invoices yet."
          />
        </Card>
      </div>
    </PortalShell>
  );
}
