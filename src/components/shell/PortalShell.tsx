import { signOut } from "@/lib/auth/actions";
import { publicConfig } from "@/lib/config.client";

export function PortalShell({
  name,
  context,
  children,
}: {
  name: string;
  context: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-neutral-50 dark:bg-neutral-950">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {publicConfig.NEXT_PUBLIC_BUSINESS_NAME}
        </span>
        <div className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{name}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{context}</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-5 lg:p-8">{children}</main>
    </div>
  );
}
