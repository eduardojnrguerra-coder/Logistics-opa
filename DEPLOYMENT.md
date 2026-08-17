# Deployment

Vercel for the app, Supabase for database and auth. One deployment serves one
business; a second business gets its own Supabase project, its own Vercel
project, and its own environment variables — no code changes.

## 1. Create the Supabase project

At [supabase.com/dashboard](https://supabase.com/dashboard), create a project
and choose the region closest to your users. Keep the database password it
generates — the CLI asks for it in the next step.

From **Project Settings → API**, note:

- Project URL
- `anon` / publishable key
- `service_role` key — **secret**. It bypasses every RLS policy in this
  repository. It belongs only in Vercel's environment variables. Never commit
  it, paste it into a chat, or expose it to the browser.

## 2. Apply the migrations

From the project root, with the project reference from your Supabase URL
(`https://<project-ref>.supabase.co`):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

If `db push` fails with `hostname resolving error`, the direct database host
(`db.<project-ref>.supabase.co`) is IPv6-only and your network has no IPv6
route. Use the connection pooler instead — copy the exact URI from
**Connect → Session pooler** in the dashboard, and push against it:

```bash
npx supabase db push --db-url "<session-pooler-uri>"
```

Use the **session** pooler on port 5432, not the transaction pooler on 6543;
migrations need a session-scoped connection.

A first attempt that dies partway can leave a transaction holding a lock on
`auth.users`, after which every retry fails with `canceling statement due to
statement timeout` on the first `create table`. Nothing has been applied when
this happens — `npx supabase migration list --db-url "<uri>"` will show no
remote versions. Wait for Postgres to reap the stuck session, or restart the
project from the dashboard, then push again.

`db push` applies everything in `supabase/migrations` in order: schema, RLS
policies, grants, and the two policy tightenings. It deliberately does **not**
run `seed.sql`, so no development accounts or demo data reach production.

Verify in the dashboard that all tables show **RLS enabled**. If any table
does not, stop — that table is readable by anyone with the anon key.

## 3. Create the first Owner/Admin

A freshly migrated database has no `profiles` rows, so `current_role()`
returns null and every policy denies every read. The app will look broken
until one administrator exists.

Follow the instructions at the top of `supabase/bootstrap-admin.sql`: create
your user through **Authentication → Users → Add user** (so the password is
set in the dashboard, not in code), then run that script once in the SQL
editor. Create all other staff from the app's Settings page afterwards.

## 4. Configure Vercel

In the Vercel project, check **Settings → General → Framework Preset** reads
**Next.js**. A project originally created for the Vite app may still be
pinned to Vite, which builds the wrong output directory and fails.

Then add these under **Settings → Environment Variables**, for Production and
Preview:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_BUSINESS_NAME` | Your business name |
| `NEXT_PUBLIC_LOGO_URL` | `/pine-x-logo.png` or your own |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Brand hex, e.g. `#1d4ed8` |
| `NEXT_PUBLIC_CURRENCY_CODE` | ISO code, e.g. `ZAR` |
| `NEXT_PUBLIC_LOCALE` | e.g. `en-ZA` |
| `BUSINESS_CONTACT_EMAIL` | Operations inbox |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key — secret |

`TRACKING_PROVIDER` defaults to `demo`. Leave the Resend and WhatsApp
variables unset until those integrations are wired up; blank optional values
are treated as unset by the config schema.

Config is validated at boot, so a missing or malformed variable fails the
build with a message naming the offending key rather than surfacing later as
a runtime error.

## 5. Deploy

Merge the migration branch into `main`. Vercel builds on push and promotes it
to the production domain.

Then smoke-test each population, because they exercise different policies:

- an Owner/Admin sees the dashboard, customers, invoices, and settings
- a dispatcher sees jobs and fleet, and `/invoices` redirects to
  `/unauthorized`
- a driver lands on `/driver` and sees only jobs assigned to them
- a customer lands on `/portal` and sees only their own deliveries and
  issued invoices
- signing out and visiting any route redirects to `/login`

## Setting this up for another business

1. Create a new Supabase project and run steps 2 and 3 against it.
2. Create a new Vercel project from the same repository.
3. Set that business's own environment variables.

Branding, currency, and locale all come from configuration, and money and
dates are formatted through `Intl.NumberFormat`, so a deployment in another
market is correct without touching component code.
