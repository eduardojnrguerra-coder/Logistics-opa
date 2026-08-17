import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { config } from "@/lib/config";
import type { Database } from "@/types/database.types";

// Server client for use in Server Components, Route Handlers, and Server
// Actions. Reads/writes the Supabase auth session via Next.js cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no request/response to
            // write cookies to — safe to ignore as long as middleware.ts
            // is refreshing the session on every request.
          }
        },
      },
    },
  );
}

// Admin client using the service-role key. Bypasses RLS entirely — only use
// for trusted server-side operations that legitimately need to act outside
// a user's own permissions (e.g. inviting a new staff/driver/customer user).
// Never expose this client or the underlying key to the browser.
export function createAdminClient() {
  return createServerClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Admin client is not session-based; no cookies to persist.
        },
      },
    },
  );
}
