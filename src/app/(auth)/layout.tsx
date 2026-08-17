import { redirect } from "next/navigation";
import { resolveHomePath } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in — send them to whichever app their role belongs to
  // instead of showing the login form again.
  if (user) redirect(await resolveHomePath());

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
