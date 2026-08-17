import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listDrivers } from "@/lib/data/queries";

type Driver = Awaited<ReturnType<typeof listDrivers>>[number];

export default async function DriversPage() {
  const drivers = await listDrivers();

  const columns: Column<Driver>[] = [
    {
      header: "Driver",
      cell: (driver) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{driver.name}</span>
      ),
    },
    { header: "Phone", cell: (driver) => driver.phone ?? "—" },
    { header: "Assigned vehicle", cell: (driver) => driver.vehicles?.registration ?? "Standby" },
    { header: "Status", cell: (driver) => <StatusBadge status={driver.status} /> },
  ];

  return (
    <>
      <PageHeader title="Drivers" description={`${drivers.length} drivers on the roster.`} />
      <Card>
        <DataTable
          columns={columns}
          rows={drivers}
          getKey={(driver) => driver.id}
          emptyMessage="No drivers yet."
        />
      </Card>
    </>
  );
}
