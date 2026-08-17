import "server-only";
import { z } from "zod";

// Full config, including secrets (Supabase service role key, provider API
// secrets, Resend key). Importing this from a client component is a build
// error by design — use `config.client.ts` for the NEXT_PUBLIC_* subset
// that's safe to ship to the browser.

// A .env file has no way to say "unset" other than leaving the value blank,
// so `FOO=` must fall through to .optional()/.default() instead of being
// validated as the empty string (which would fail .email(), .length(3), an
// enum check, and so on).
function blankAsUnset<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => (value === "" ? undefined : value), schema);
}

// Deliberately not z.coerce.boolean(): that is JS truthiness, so the string
// "false" would coerce to true.
const envBoolean = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  // Business identity (white-label branding)
  NEXT_PUBLIC_BUSINESS_NAME: z.string().min(1),
  NEXT_PUBLIC_LOGO_URL: blankAsUnset(z.string().optional()),
  NEXT_PUBLIC_PRIMARY_COLOR: blankAsUnset(z.string().default("#1d4ed8")),
  NEXT_PUBLIC_CURRENCY_CODE: blankAsUnset(z.string().length(3).default("ZAR")),
  NEXT_PUBLIC_LOCALE: blankAsUnset(z.string().default("en-ZA")),

  // Business contact details (replaces hardcoded personal contact info)
  BUSINESS_CONTACT_EMAIL: z.string().email(),
  BUSINESS_CONTACT_PHONE: blankAsUnset(z.string().optional()),
  BUSINESS_WHATSAPP_NUMBER: blankAsUnset(z.string().optional()),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Email (Resend)
  RESEND_API_KEY: blankAsUnset(z.string().optional()),
  RESEND_FROM_EMAIL: blankAsUnset(z.string().email().optional()),

  // Fleet tracking provider
  TRACKING_PROVIDER: blankAsUnset(
    z
      .enum([
        "demo",
        "cartrack",
        "netstar",
        "tracker_sa",
        "mix_telematics",
        "ctrack",
        "webfleet",
        "teltonika",
      ])
      .default("demo"),
  ),
  TRACKING_API_KEY: blankAsUnset(z.string().optional()),
  TRACKING_API_SECRET: blankAsUnset(z.string().optional()),

  // WhatsApp (optional channel)
  WHATSAPP_ENABLED: blankAsUnset(envBoolean),
  WHATSAPP_PROVIDER: blankAsUnset(z.enum(["twilio", "meta_cloud_api"]).optional()),
  WHATSAPP_API_TOKEN: blankAsUnset(z.string().optional()),
});

export type AppConfig = z.infer<typeof envSchema>;

function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Check your .env against .env.example:\n${issues}`,
    );
  }

  return parsed.data;
}

export const config = loadConfig();
