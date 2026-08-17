# Logistics Operations Platform

Fleet, dispatch, and billing operations for a logistics business: an internal
ops console for staff, plus self-service portals where drivers see their own
work and customers see their own deliveries and invoices.

Built with Next.js (App Router) and Supabase. The deployment is single-tenant
and configured entirely through environment variables, so the same codebase
can be branded and run for a different business without touching component
code.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React Server Components |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database / auth | Supabase (Postgres + GoTrue), `@supabase/ssr` |
| Authorization | Postgres Row Level Security |

## Authorization model

Access control lives in the database, not just the UI. Every table has RLS
enabled, and policies resolve the caller's identity through
`current_role()`, `current_driver_id()`, and `current_customer_id()` (see
`supabase/migrations/0002_rls_policies.sql`).

Three separate populations sign in through one form:

- **Staff** — password sign-in. Six roles: Owner/Admin, Operations Manager,
  Dispatcher, Driver, Finance, Maintenance Manager.
- **Drivers** — see only jobs assigned to them, plus the customers and
  vehicles attached to those jobs. Nothing else.
- **Customers** — see only their own deliveries and issued invoices. Drafts
  stay internal.

Route protection is layered deliberately:

1. `src/proxy.ts` turns away anonymous requests before a page renders. This
   has to happen in the proxy rather than a layout, because layouts and pages
   render in parallel — a page's data fetch would otherwise run and throw a
   raw `permission denied` before a layout-level redirect took effect.
2. Layouts route each authenticated user to the app their role belongs to.
3. `requireRole()` / `requirePermission()` guard individual pages and server
   actions (`src/lib/auth/guards.ts`).
4. RLS is the actual boundary. Layers 1–3 are defence in depth; a bug in any
   of them still cannot leak another tenant's rows.

## Local development

Requires Node 20+ and Docker (for the local Supabase stack).

```bash
npm install
npx supabase start
cp .env.example .env.local
npm run dev
```

`npx supabase start` prints the local API URL and keys — copy them into
`.env.local`. Config is validated with zod at boot (`src/lib/config.ts`), so
a missing or malformed variable fails immediately with a readable message
rather than surfacing as a runtime error later.

### Seeded accounts

`supabase/seed.sql` runs on `supabase db reset` and creates four accounts,
all with the password `admin`:

| Email | Role | Sees |
| --- | --- | --- |
| `admin@example.com` | Owner/Admin | Everything |
| `dispatch@example.com` | Dispatcher | Jobs and fleet, no financials |
| `driver@example.com` | Driver | Only their own assigned jobs |
| `customer@example.com` | Customer portal | Only their own account |

These are local development credentials. `supabase db push` does not execute
seed files, so they never reach a hosted project — and they must never be
created on one.

## Configuration

Every business-specific value is an environment variable; see `.env.example`
for the full list. Branding, currency, and locale are read through
`Intl.NumberFormat`, so a deployment in another market formats money and
dates correctly without code changes.

The config module is split so secrets cannot leak into the browser bundle:

- `src/lib/config.ts` — server-only, includes the service role key and
  provider secrets. Marked `server-only`, so importing it from a client
  component is a build error.
- `src/lib/config.client.ts` — the `NEXT_PUBLIC_*` subset.

## Database changes

Migrations are plain SQL in `supabase/migrations`, applied in order.

```bash
npx supabase migration new <name>   # create
npx supabase db reset               # re-apply everything + seed
npx supabase gen types typescript --local > src/types/database.types.ts
```

Regenerate the types after any schema change; they are what makes the query
layer in `src/lib/data/queries.ts` type-safe end to end.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```

Note: do not run `npm run build` while `npm run dev` is running. Both write
to `.next/`, and the collision leaves the dev server serving chunks that
never hydrate.

## Repository layout

```
src/
  app/
    (auth)/         login
    (dashboard)/    staff ops console
    (portal)/       driver and customer self-service
  components/
    shell/          layout chrome (sidebar, header)
    ui/             card, table, status badge
  lib/
    auth/           roles, permission matrix, route guards
    data/           Supabase query modules
    supabase/       browser, server, and admin clients
supabase/
  migrations/         schema, RLS policies, grants
  seed.sql            local development data
  sample-data.sql     optional demo records for a hosted project
  bootstrap-admin.sql one-time first-administrator setup
```
