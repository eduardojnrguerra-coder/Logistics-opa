import { createBrowserClient } from "@supabase/ssr";
import { publicConfig } from "@/lib/config.client";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
