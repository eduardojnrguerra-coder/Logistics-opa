const TONE_CLASSES = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",
  neutral: "bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400 dark:ring-neutral-400/20",
} as const;

type Tone = keyof typeof TONE_CLASSES;

// Status vocabularies differ per entity (a job is "Delivered", an invoice is
// "Paid"), so tone is resolved from the whole set rather than per table.
const STATUS_TONES: Record<string, Tone> = {
  // jobs
  Delivered: "positive",
  "On Route": "info",
  Loaded: "info",
  "At Pickup": "info",
  "At Dropoff": "info",
  Dispatched: "info",
  Scheduled: "neutral",
  Delayed: "danger",
  Cancelled: "neutral",
  // vehicles / drivers
  Active: "positive",
  Available: "positive",
  "On Duty": "info",
  Idle: "neutral",
  "Off Duty": "neutral",
  "On Leave": "neutral",
  Maintenance: "warning",
  Offline: "danger",
  // invoices / quotes
  Paid: "positive",
  Accepted: "positive",
  Sent: "info",
  "Part Paid": "warning",
  Draft: "neutral",
  Overdue: "danger",
  Rejected: "danger",
  Expired: "neutral",
  Converted: "positive",
  // maintenance / alerts
  Completed: "positive",
  Open: "warning",
  "In Progress": "info",
  New: "danger",
  Acknowledged: "warning",
  Resolved: "positive",
  Critical: "danger",
  Warning: "warning",
  Info: "info",
  // customers
  "At Risk": "warning",
  "On Hold": "danger",
  Low: "positive",
  Medium: "warning",
  High: "danger",
};

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-400">—</span>;
  const tone = STATUS_TONES[status] ?? "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {status}
    </span>
  );
}
