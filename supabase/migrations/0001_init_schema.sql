-- Core schema for a single-tenant deployment. One deployment = one business;
-- there is no tenant_id column anywhere by design (see lib/config.ts for the
-- env-var-driven white-label/business config instead of DB-driven tenancy).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (
    role in (
      'owner_admin',
      'operations_manager',
      'dispatcher',
      'driver',
      'finance',
      'maintenance_manager'
    )
  ),
  driver_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  status text not null default 'Active' check (status in ('Active', 'At Risk', 'On Hold')),
  risk_level text check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  customer_type text,
  created_at timestamptz not null default now()
);

-- Customer portal login, kept separate from `profiles` (staff) so a
-- customer contact authenticating never gains a staff role by accident.
create table public.customer_users (
  id uuid primary key references auth.users (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid (),
  registration text not null unique,
  name text,
  type text,
  status text not null default 'Active' check (status in ('Active', 'Idle', 'Maintenance', 'Offline')),
  tracking_provider text,
  tracking_external_id text,
  created_at timestamptz not null default now()
);

create table public.drivers (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  phone text,
  status text not null default 'Available' check (status in ('Available', 'On Duty', 'Off Duty', 'On Leave')),
  assigned_vehicle_id uuid references public.vehicles (id),
  created_at timestamptz not null default now()
);

alter table public.profiles
add constraint profiles_driver_fk foreign key (driver_id) references public.drivers (id);

create table public.jobs (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references public.customers (id),
  assigned_driver_id uuid references public.drivers (id),
  assigned_vehicle_id uuid references public.vehicles (id),
  status text not null default 'Scheduled',
  priority text default 'Medium',
  pickup_address text,
  dropoff_address text,
  scheduled_at timestamptz,
  delivered_at timestamptz,
  pod_photo_url text,
  pod_signature_url text,
  pod_notes text,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references public.customers (id),
  status text not null default 'Draft',
  amount numeric(12, 2) not null default 0,
  currency text not null default 'ZAR',
  valid_until date,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references public.customers (id),
  job_id uuid references public.jobs (id),
  status text not null default 'Draft',
  amount numeric(12, 2) not null default 0,
  currency text not null default 'ZAR',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid (),
  vehicle_id uuid not null references public.vehicles (id),
  type text not null,
  status text not null default 'Open',
  cost numeric(10, 2),
  scheduled_at date,
  completed_at date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid (),
  vehicle_id uuid references public.vehicles (id),
  type text not null,
  severity text not null check (severity in ('Info', 'Warning', 'Critical')),
  status text not null default 'New' check (status in ('New', 'Acknowledged', 'Resolved')),
  message text,
  created_at timestamptz not null default now()
);

create table public.customer_messages (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references public.customers (id),
  sender_type text not null check (sender_type in ('staff', 'customer')),
  sender_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

-- Singleton row: business-editable-at-runtime settings, bootstrapped from
-- env vars on first run (see lib/config.ts). Settings page writes here;
-- .env stays the deploy-time bootstrap/default.
create table public.business_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null,
  currency_code text not null default 'ZAR',
  locale text not null default 'en-ZA',
  primary_color text default '#1d4ed8',
  logo_url text,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  invoice_notes_default text,
  updated_at timestamptz not null default now()
);

-- Status/metadata only — real provider credentials live in server-only env
-- vars (TRACKING_API_KEY / TRACKING_API_SECRET), never in this table.
create table public.tracking_provider_status (
  provider text primary key,
  status text not null default 'not_connected',
  vehicles_linked_count int default 0,
  last_synced_at timestamptz
);
