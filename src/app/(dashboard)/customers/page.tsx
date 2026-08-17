import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requirePermission } from "@/lib/auth/guards";
import { listCustomers } from "@/lib/data/queries";

type Customer = Awaited<ReturnType<typeof listCustomers>>[number];

export default async function CustomersPage() {
  await requirePermission("manageCustomers");
  const customers = await listCustomers();

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      cell: (customer) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{customer.name}</span>
      ),
    },
    { header: "Contact", cell: (customer) => customer.contact_name ?? "—" },
    { header: "Email", cell: (customer) => customer.email ?? "—" },
    { header: "Type", cell: (customer) => customer.customer_type ?? "—" },
    { header: "Risk", cell: (customer) => <StatusBadge status={customer.risk_level} /> },
    { header: "Status", cell: (customer) => <StatusBadge status={customer.status} /> },
  ];

  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} customer accounts.`} />
      <Card>
        <DataTable
          columns={columns}
          rows={customers}
          getKey={(customer) => customer.id}
          emptyMessage="No customers yet."
        />
      </Card>
    </>
  );
}
