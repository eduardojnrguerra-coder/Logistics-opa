import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listAlerts, listMaintenance } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/format";

type Record_ = Awaited<ReturnType<typeof listMaintenance>>[number];
type Alert = Awaited<ReturnType<typeof listAlerts>>[number];

export default async function MaintenancePage() {
  const [records, alerts] = await Promise.all([listMaintenance(), listAlerts()]);

  const recordColumns: Column<Record_>[] = [
    { header: "Vehicle", cell: (record) => record.vehicles?.registration ?? "—" },
    { header: "Type", cell: (record) => record.type },
    {
      header: "Notes",
      cell: (record) => (
        <span className="text-neutral-500 dark:text-neutral-400">{record.notes ?? "—"}</span>
      ),
    },
    {
      header: "Scheduled",
      cell: (record) => (record.scheduled_at ? formatDate(record.scheduled_at) : "—"),
    },
    {
      header: "Cost",
      align: "right",
      cell: (record) => (record.cost ? formatCurrency(Number(record.cost)) : "—"),
    },
    { header: "Status", cell: (record) => <StatusBadge status={record.status} /> },
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
    { header: "Status", cell: (alert) => <StatusBadge status={alert.status} /> },
  ];

  return (
    <>
      <PageHeader title="Maintenance" description="Workshop schedule and unresolved fleet alerts." />

      <div className="space-y-6">
        <Card title="Open alerts" subtitle="Exceptions raised against vehicles">
          <DataTable
            columns={alertColumns}
            rows={alerts}
            getKey={(alert) => alert.id}
            emptyMessage="No open alerts."
          />
        </Card>

        <Card title="Maintenance records" subtitle="Scheduled and completed workshop jobs">
          <DataTable
            columns={recordColumns}
            rows={records}
            getKey={(record) => record.id}
            emptyMessage="No maintenance records yet."
          />
        </Card>
      </div>
    </>
  );
}
