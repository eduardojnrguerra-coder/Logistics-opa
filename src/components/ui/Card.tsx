import Link from "next/link";
import type { ComponentType } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const STAT_TONES = {
  default: "text-neutral-900 dark:text-neutral-50",
  positive: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  meta?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  href?: string;
  tone?: keyof typeof STAT_TONES;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        {Icon && <Icon size={16} className="text-neutral-400 dark:text-neutral-500" />}
      </div>
      <strong className={`mt-2 block text-2xl font-semibold tracking-tight ${STAT_TONES[tone]}`}>
        {value}
      </strong>
      {meta && <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">{meta}</span>}
    </>
  );

  const base =
    "block rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900";

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} transition hover:border-neutral-300 hover:shadow-sm dark:hover:border-neutral-700`}
      >
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
      {message}
    </div>
  );
}
