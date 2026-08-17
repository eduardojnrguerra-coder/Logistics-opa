import { z } from "zod";

// Public subset of the app config, safe to import from client components.
// Only NEXT_PUBLIC_* vars belong here — anything else is a secret and must
// stay in config.ts (server-only).

// See the note in config.ts: a blank env var means "unset", not "empty
// string", so it has to fall through to .optional()/.default().
function blankAsUnset<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => (value === "" ? undefined : value), schema);
}

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BUSINESS_NAME: z.string().min(1),
  NEXT_PUBLIC_LOGO_URL: blankAsUnset(z.string().optional()),
  NEXT_PUBLIC_PRIMARY_COLOR: blankAsUnset(z.string().default("#1d4ed8")),
  NEXT_PUBLIC_CURRENCY_CODE: blankAsUnset(z.string().length(3).default("ZAR")),
  NEXT_PUBLIC_LOCALE: blankAsUnset(z.string().default("en-ZA")),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicAppConfig = z.infer<typeof publicEnvSchema>;

function loadPublicConfig(): PublicAppConfig {
  // Each var is referenced explicitly rather than spreading process.env:
  // Next.js inlines NEXT_PUBLIC_* vars into the client bundle by static
  // analysis, so a dynamic lookup would come back undefined in the browser.
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_BUSINESS_NAME: process.env.NEXT_PUBLIC_BUSINESS_NAME,
    NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
    NEXT_PUBLIC_PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
    NEXT_PUBLIC_CURRENCY_CODE: process.env.NEXT_PUBLIC_CURRENCY_CODE,
    NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid public environment configuration. Check your .env against .env.example:\n${issues}`,
    );
  }

  return parsed.data;
}

export const publicConfig = loadPublicConfig();
