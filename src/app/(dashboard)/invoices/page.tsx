import { Card, PageHeader, StatCard } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requirePermission } from "@/lib/auth/guards";
import { listInvoices } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/format";

type Invoice = Awaited<ReturnType<typeof listInvoices>>[number];

export default async function InvoicesPage() {
  await requirePermission("manageFinance");
  const invoices = await listInvoices();

  const outstanding = invoices
    .filter((invoice) => ["Sent", "Part Paid", "Overdue"].includes(invoice.status))
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const overdue = invoices
    .filter((invoice) => invoice.status === "Overdue")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const paid = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const columns: Column<Invoice>[] = [
    { header: "Customer", cell: (invoice) => invoice.customers?.name ?? "—" },
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
    { header: "Paid", cell: (invoice) => (invoice.paid_at ? formatDate(invoice.paid_at) : "—") },
    { header: "Status", cell: (invoice) => <StatusBadge status={invoice.status} /> },
  ];

  return (
    <>
      <PageHeader title="Invoices" description="Billing position across all customers." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} meta="Issued and unpaid" />
        <StatCard
          label="Overdue"
          value={formatCurrency(overdue)}
          meta="Past due date"
          tone={overdue > 0 ? "danger" : "positive"}
        />
        <StatCard label="Collected" value={formatCurrency(paid)} meta="Paid to date" tone="positive" />
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={invoices}
          getKey={(invoice) => invoice.id}
          emptyMessage="No invoices yet."
        />
      </Card>
    </>
  );
}
