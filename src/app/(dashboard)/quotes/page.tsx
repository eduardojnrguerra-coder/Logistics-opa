import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requirePermission } from "@/lib/auth/guards";
import { listQuotes } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/format";

type Quote = Awaited<ReturnType<typeof listQuotes>>[number];

export default async function QuotesPage() {
  await requirePermission("manageFinance");
  const quotes = await listQuotes();

  const pipeline = quotes
    .filter((quote) => ["Draft", "Sent"].includes(quote.status))
    .reduce((sum, quote) => sum + Number(quote.amount), 0);

  const columns: Column<Quote>[] = [
    { header: "Customer", cell: (quote) => quote.customers?.name ?? "—" },
    {
      header: "Amount",
      align: "right",
      cell: (quote) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {formatCurrency(Number(quote.amount))}
        </span>
      ),
    },
    { header: "Valid until", cell: (quote) => (quote.valid_until ? formatDate(quote.valid_until) : "—") },
    { header: "Status", cell: (quote) => <StatusBadge status={quote.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Quotes"
        description={`${formatCurrency(pipeline)} in draft and sent quotes awaiting a decision.`}
      />
      <Card>
        <DataTable
          columns={columns}
          rows={quotes}
          getKey={(quote) => quote.id}
          emptyMessage="No quotes yet."
        />
      </Card>
    </>
  );
}
