import { signOut } from "@/lib/auth/actions";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";

export function Header({ fullName, role }: { fullName: string; role: Role }) {
  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-right leading-tight">
        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{fullName}</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">{ROLE_LABELS[role]}</div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
