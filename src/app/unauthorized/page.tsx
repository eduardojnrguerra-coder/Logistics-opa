export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        You don&rsquo;t have access to this page
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        If you think this is a mistake, ask an Owner/Admin to check your account&rsquo;s role.
      </p>
    </div>
  );
}
