import { EmptyState } from "@/components/ui/Card";

export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  columns,
  rows,
  getKey,
  emptyMessage = "Nothing to show yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    // Wide tables scroll inside the card rather than pushing the page sideways.
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-5 py-2.5 text-xs font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400 ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr key={getKey(row)} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-5 py-3 whitespace-nowrap text-neutral-700 dark:text-neutral-300 ${
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
