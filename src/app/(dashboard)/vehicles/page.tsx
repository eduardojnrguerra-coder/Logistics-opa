import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listVehicles } from "@/lib/data/queries";

type Vehicle = Awaited<ReturnType<typeof listVehicles>>[number];

export default async function VehiclesPage() {
  const vehicles = await listVehicles();

  const columns: Column<Vehicle>[] = [
    {
      header: "Registration",
      cell: (vehicle) => (
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {vehicle.registration}
        </span>
      ),
    },
    { header: "Vehicle", cell: (vehicle) => vehicle.name ?? "—" },
    { header: "Type", cell: (vehicle) => vehicle.type ?? "—" },
    { header: "Tracker", cell: (vehicle) => vehicle.tracking_provider ?? "Not linked" },
    { header: "Status", cell: (vehicle) => <StatusBadge status={vehicle.status} /> },
  ];

  return (
    <>
      <PageHeader title="Vehicles" description={`${vehicles.length} vehicles in the fleet.`} />
      <Card>
        <DataTable
          columns={columns}
          rows={vehicles}
          getKey={(vehicle) => vehicle.id}
          emptyMessage="No vehicles yet."
        />
      </Card>
    </>
  );
}
