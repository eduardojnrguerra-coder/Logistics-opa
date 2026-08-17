-- The staff read policies in 0002 were written as "current_role() is not
-- null", which is true for a driver as well. That handed every driver the
-- full customer book (names, emails, phone numbers, site addresses) and the
-- personal phone number of every other driver.
--
-- A driver needs only the records attached to their own work: the customer
-- and vehicle on a job assigned to them, and their own driver row. These
-- policies scope reads to exactly that. PostgREST embeds such as
-- jobs -> customers(name) keep working, because the rows a driver is allowed
-- to embed are the ones these policies still admit.
-- Customers ------------------------------------------------------------------
drop policy "staff_read_customers" on public.customers;

create policy "staff_read_customers" on public.customers for select using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher',
    'finance',
    'maintenance_manager'
  )
);

create policy "driver_read_job_customers" on public.customers for select using (
  public.current_role () = 'driver'
  and exists (
    select
      1
    from
      public.jobs j
    where
      j.customer_id = customers.id
      and j.assigned_driver_id = public.current_driver_id ()
  )
);

-- Drivers --------------------------------------------------------------------
drop policy "staff_read_drivers" on public.drivers;

create policy "staff_read_drivers" on public.drivers for select using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher',
    'finance',
    'maintenance_manager'
  )
);

create policy "driver_read_self" on public.drivers for select using (
  public.current_role () = 'driver'
  and id = public.current_driver_id ()
);

-- Vehicles -------------------------------------------------------------------
drop policy "staff_read_vehicles" on public.vehicles;

create policy "staff_read_vehicles" on public.vehicles for select using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher',
    'finance',
    'maintenance_manager'
  )
);

create policy "driver_read_job_vehicles" on public.vehicles for select using (
  public.current_role () = 'driver'
  and exists (
    select
      1
    from
      public.jobs j
    where
      j.assigned_vehicle_id = vehicles.id
      and j.assigned_driver_id = public.current_driver_id ()
  )
);

-- Staff directory ------------------------------------------------------------
-- profiles carries every colleague's name, email, and role. A driver has no
-- reason to enumerate staff, so restrict them to their own row.
drop policy "staff_read_profiles" on public.profiles;

create policy "staff_read_profiles" on public.profiles for select using (
  public.current_role () in (
    'owner_admin',
    'operations_manager',
    'dispatcher',
    'finance',
    'maintenance_manager'
  )
);

create policy "driver_read_own_profile" on public.profiles for select using (id = auth.uid ());
