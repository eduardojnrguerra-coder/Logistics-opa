-- Row Level Security: this is the real authorization boundary. App-level
-- role checks (lib/auth/guards.ts) are defense-in-depth on top of this, not
-- a substitute for it — a bug in a server action must not be able to leak
-- another customer's or driver's data.

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.customer_users enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.jobs enable row level security;
alter table public.quotes enable row level security;
alter table public.invoices enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.alerts enable row level security;
alter table public.customer_messages enable row level security;
alter table public.business_settings enable row level security;
alter table public.tracking_provider_status enable row level security;

create function public.current_role () returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql
security definer
stable;

create function public.current_driver_id () returns uuid as $$
  select driver_id from public.profiles where id = auth.uid()
$$ language sql
security definer
stable;

create function public.current_customer_id () returns uuid as $$
  select customer_id from public.customer_users where id = auth.uid()
$$ language sql
security definer
stable;

-- profiles: staff can read each other (needed for assignment pickers etc);
-- only Owner/Admin can write (invite/deactivate/change roles).
create policy "staff_read_profiles" on public.profiles for select using (public.current_role () is not null);

create policy "owner_admin_write_profiles" on public.profiles for all using (public.current_role () = 'owner_admin')
with
  check (public.current_role () = 'owner_admin');

-- customers: all staff can read; Owner/Admin + Ops Manager can write.
create policy "staff_read_customers" on public.customers for select using (public.current_role () is not null);

create policy "ops_write_customers" on public.customers for all using (
  public.current_role () in ('owner_admin', 'operations_manager')
)
with
  check (
    public.current_role () in ('owner_admin', 'operations_manager')
  );

-- customer_users: staff can read (to grant/manage portal access); a
-- customer_user can read their own row only.
create policy "staff_read_customer_users" on public.customer_users for select using (public.current_role () is not null);

create policy "customer_read_own_user" on public.customer_users for select using (id = auth.uid ());

create policy "owner_admin_write_customer_users" on public.customer_users for all using (public.current_role () = 'owner_admin')
with
  check (public.current_role () = 'owner_admin');

-- vehicles / drivers: all staff can read; Ops Manager + Maintenance Manager
-- can write. Drivers can read (need to see their own assigned vehicle).
create policy "staff_read_vehicles" on public.vehicles for select using (
  public.current_role () is not null
);

create policy "ops_write_vehicles" on public.vehicles for all using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'maintenance_manager'
  )
)
with
  check (
    public.current_role () in (
      'owner_admin',
      'operations_manager',
      'maintenance_manager'
    )
  );

create policy "staff_read_drivers" on public.drivers for select using (public.current_role () is not null);

create policy "ops_write_drivers" on public.drivers for all using (
  public.current_role () in ('owner_admin', 'operations_manager')
)
with
  check (
    public.current_role () in ('owner_admin', 'operations_manager')
  );

-- jobs: staff (non-driver) see everything; a driver sees/updates only jobs
-- assigned to them; a customer sees only their own jobs.
create policy "staff_read_jobs" on public.jobs for select using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher',
    'finance'
  )
);

create policy "dispatch_write_jobs" on public.jobs for all using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher'
  )
)
with
  check (
    public.current_role () in (
      'owner_admin',
      'operations_manager',
      'dispatcher'
    )
  );

create policy "driver_read_own_jobs" on public.jobs for select using (
  public.current_role () = 'driver'
  and assigned_driver_id = public.current_driver_id ()
);

create policy "driver_update_own_jobs" on public.jobs
for update
  using (
    public.current_role () = 'driver'
    and assigned_driver_id = public.current_driver_id ()
  )
with
  check (
    assigned_driver_id = public.current_driver_id ()
  );

create policy "customer_read_own_jobs" on public.jobs for select using (customer_id = public.current_customer_id ());

-- quotes / invoices: Owner/Admin, Ops Manager, Finance read+write; customers
-- read only their own.
create policy "finance_read_write_quotes" on public.quotes for all using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'finance'
  )
)
with
  check (
    public.current_role () in (
      'owner_admin',
      'operations_manager',
      'finance'
    )
  );

create policy "customer_read_own_quotes" on public.quotes for select using (customer_id = public.current_customer_id ());

create policy "finance_read_write_invoices" on public.invoices for all using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'finance'
  )
)
with
  check (
    public.current_role () in (
      'owner_admin',
      'operations_manager',
      'finance'
    )
  );

create policy "customer_read_own_invoices" on public.invoices for select using (customer_id = public.current_customer_id ());

-- maintenance: Maintenance Manager + Owner/Admin read+write; other staff
-- read-only.
create policy "staff_read_maintenance" on public.maintenance_records for select using (public.current_role () is not null);

create policy "maintenance_write" on public.maintenance_records for all using (
  public.current_role () in ('owner_admin', 'maintenance_manager')
)
with
  check (
    public.current_role () in ('owner_admin', 'maintenance_manager')
  );

-- alerts: all staff read; Ops Manager + Owner/Admin can acknowledge/resolve.
create policy "staff_read_alerts" on public.alerts for select using (public.current_role () is not null);

create policy "ops_write_alerts" on public.alerts for all using (
  public.current_role () in ('owner_admin', 'operations_manager')
)
with
  check (
    public.current_role () in ('owner_admin', 'operations_manager')
  );

-- customer_messages: staff can read/write for any customer; a customer_user
-- can read/write only their own thread.
create policy "staff_read_write_messages" on public.customer_messages for all using (public.current_role () is not null)
with
  check (public.current_role () is not null);

create policy "customer_read_own_messages" on public.customer_messages for select using (customer_id = public.current_customer_id ());

create policy "customer_write_own_messages" on public.customer_messages for insert
with
  check (
    customer_id = public.current_customer_id ()
    and sender_type = 'customer'
  );

-- business_settings: any authenticated staff can read (needed for branding
-- in the UI shell); only Owner/Admin can write.
create policy "staff_read_business_settings" on public.business_settings for select using (public.current_role () is not null);

create policy "owner_admin_write_business_settings" on public.business_settings for all using (public.current_role () = 'owner_admin')
with
  check (public.current_role () = 'owner_admin');

-- tracking_provider_status: staff read; Ops Manager + Owner/Admin write.
create policy "staff_read_tracking_status" on public.tracking_provider_status for select using (public.current_role () is not null);

create policy "ops_write_tracking_status" on public.tracking_provider_status for all using (
  public.current_role () in ('owner_admin', 'operations_manager')
)
with
  check (
    public.current_role () in ('owner_admin', 'operations_manager')
  );
