-- ---------------------------------------------------------------------------
-- OPTIONAL DEMO DATA
--
-- Populates a deployment with realistic fleet, customer, and billing records
-- so the app can be shown before real operations exist. Safe to run against a
-- hosted project: it creates no accounts, no passwords, and no auth rows —
-- only business records.
--
-- Every row uses a deterministic id prefix, so it can all be removed again
-- with the cleanup block at the bottom of this file. Run that before going
-- into real use, or the fake customers will sit alongside genuine ones.
--
-- Re-running is safe; existing rows are left alone.
-- ---------------------------------------------------------------------------
-- Customers -----------------------------------------------------------------
insert into
  public.customers (
    id,
    name,
    contact_name,
    email,
    phone,
    address,
    status,
    risk_level,
    customer_type
  )
values
  ('10000000-0000-0000-0000-000000000001', 'HFC Construction', 'Pieter van Wyk', 'pieter@hfc.example.com', '028 312 3456', '14 Industria Road, Hermanus', 'Active', 'Low', 'Construction'),
  ('10000000-0000-0000-0000-000000000002', 'Coastal Build', 'Ayesha Daniels', 'ayesha@coastalbuild.example.com', '028 314 8890', '3 Marine Drive, Kleinmond', 'Active', 'Medium', 'Construction'),
  ('10000000-0000-0000-0000-000000000003', 'Overstrand Municipality', 'Thandi Mokoena', 'procurement@overstrand.example.com', '028 313 8000', 'Magnolia Avenue, Hermanus', 'Active', 'Low', 'Government'),
  ('10000000-0000-0000-0000-000000000004', 'Pine Avenue Civils', 'Johan Bester', 'johan@pineavenue.example.com', '021 851 2244', '88 Main Road, Somerset West', 'At Risk', 'High', 'Civils'),
  ('10000000-0000-0000-0000-000000000005', 'Boland Quarry Supplies', 'Lerato Dlamini', 'orders@bolandquarry.example.com', '021 887 1120', 'R44 Industrial Park, Stellenbosch', 'Active', 'Low', 'Quarry'),
  ('10000000-0000-0000-0000-000000000006', 'Gansbaai Marine Works', 'Riaan Louw', 'riaan@gansbaaimarine.example.com', '028 384 0091', 'Harbour Road, Gansbaai', 'On Hold', 'Critical', 'Marine')
on conflict (id) do nothing;

-- Vehicles ------------------------------------------------------------------
insert into
  public.vehicles (id, registration, name, type, status, tracking_provider, tracking_external_id)
values
  ('20000000-0000-0000-0000-000000000001', 'CA 412 883', 'Mercedes Axor', 'Semi-Bulk', 'Active', 'demo', 'DEMO-8801'),
  ('20000000-0000-0000-0000-000000000002', 'CA 556 201', 'Isuzu FTR', 'Tipper', 'Active', 'demo', 'DEMO-8802'),
  ('20000000-0000-0000-0000-000000000003', 'CA 118 440', 'Scania G460', 'Semi-Bulk', 'Active', 'demo', 'DEMO-8803'),
  ('20000000-0000-0000-0000-000000000004', 'CA 907 315', 'Hino 500', 'Drop Side', 'Maintenance', 'demo', 'DEMO-8804'),
  ('20000000-0000-0000-0000-000000000005', 'CA 233 776', 'MAN TGS', 'Tipper', 'Active', 'demo', 'DEMO-8805'),
  ('20000000-0000-0000-0000-000000000006', 'CA 688 194', 'Volvo FH', 'Tautliner', 'Idle', 'demo', 'DEMO-8806'),
  ('20000000-0000-0000-0000-000000000007', 'CA 774 052', 'Isuzu NQR', 'Drop Side', 'Offline', 'demo', 'DEMO-8807'),
  ('20000000-0000-0000-0000-000000000008', 'CA 349 617', 'Mercedes Actros', 'Semi-Bulk', 'Active', 'demo', 'DEMO-8808')
on conflict (id) do nothing;

-- Drivers -------------------------------------------------------------------
insert into
  public.drivers (id, name, phone, status, assigned_vehicle_id)
values
  ('30000000-0000-0000-0000-000000000001', 'Sipho Ndlovu', '072 445 1180', 'On Duty', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'Andre Fourie', '083 220 7741', 'On Duty', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003', 'Michael Adams', '079 118 3320', 'On Duty', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000004', 'Nomsa Khumalo', '074 903 6612', 'Available', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000005', 'Willem Botha', '082 771 4405', 'Off Duty', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000006', 'Grace Sithole', '076 334 2298', 'On Leave', null)
on conflict (id) do nothing;

-- Jobs ----------------------------------------------------------------------
-- Dates are relative to when this runs, so the dashboard always looks current.
insert into
  public.jobs (
    id, customer_id, assigned_driver_id, assigned_vehicle_id, status, priority,
    pickup_address, dropoff_address, scheduled_at, delivered_at
  )
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'On Route',  'High',   'Boland Quarry, Stellenbosch', 'Industria Road, Hermanus',  now() - interval '3 hours', null),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'At Pickup', 'Medium', 'Caledon Depot',               'Marine Drive, Kleinmond',   now() - interval '1 hour',  null),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Delayed',   'High',   'Cape Town Harbour',           'Magnolia Avenue, Hermanus', now() - interval '6 hours', null),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Scheduled', 'Medium', 'Boland Quarry, Stellenbosch', 'Main Road, Somerset West',  now() + interval '1 day',   null),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'Scheduled', 'Low',    'Gansbaai Yard',               'R44 Park, Stellenbosch',    now() + interval '2 days',  null),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Delivered', 'Medium', 'Caledon Depot',               'Industria Road, Hermanus',  now() - interval '2 days',  now() - interval '2 days'),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Delivered', 'High',   'Cape Town Harbour',           'Marine Drive, Kleinmond',   now() - interval '3 days',  now() - interval '3 days'),
  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Delivered', 'Medium', 'Boland Quarry, Stellenbosch', 'Magnolia Avenue, Hermanus', now() - interval '4 days',  now() - interval '4 days'),
  ('40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'Delivered', 'Low',    'Gansbaai Yard',               'R44 Park, Stellenbosch',    now() - interval '5 days',  now() - interval '5 days'),
  ('40000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'Cancelled', 'Low',    'Caledon Depot',               'Main Road, Somerset West',  now() - interval '6 days',  null),
  ('40000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', 'Loaded',    'High',   'Boland Quarry, Stellenbosch', 'Industria Road, Hermanus',  now() - interval '2 hours', null),
  ('40000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'Delivered', 'Medium', 'Harbour Road, Gansbaai',      'Cape Town Harbour',         now() - interval '8 days',  now() - interval '8 days')
on conflict (id) do nothing;

-- Quotes --------------------------------------------------------------------
insert into
  public.quotes (id, customer_id, status, amount, currency, valid_until)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sent',     48500.00, 'ZAR', (now() + interval '14 days')::date),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Draft',    22750.00, 'ZAR', (now() + interval '21 days')::date),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Sent',    137400.00, 'ZAR', (now() + interval '7 days')::date),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'Accepted', 64300.00, 'ZAR', (now() + interval '30 days')::date),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Rejected', 18900.00, 'ZAR', (now() - interval '3 days')::date)
on conflict (id) do nothing;

-- Invoices ------------------------------------------------------------------
insert into
  public.invoices (id, customer_id, job_id, status, amount, currency, due_date, paid_at)
values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006', 'Paid',    31200.00, 'ZAR', (now() - interval '5 days')::date,  now() - interval '6 days'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000007', 'Overdue', 45800.00, 'ZAR', (now() - interval '12 days')::date, null),
  ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', 'Sent',    27650.00, 'ZAR', (now() + interval '9 days')::date,  null),
  ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', null,                                    'Overdue', 92300.00, 'ZAR', (now() - interval '28 days')::date, null),
  ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000009', 'Sent',    15400.00, 'ZAR', (now() + interval '16 days')::date, null),
  ('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', null,                                    'Draft',   38900.00, 'ZAR', (now() + interval '30 days')::date, null),
  ('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-00000000000c', 'Overdue', 21050.00, 'ZAR', (now() - interval '45 days')::date, null),
  ('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', null,                                    'Paid',    54700.00, 'ZAR', (now() - interval '20 days')::date, now() - interval '22 days')
on conflict (id) do nothing;

-- Maintenance ---------------------------------------------------------------
insert into
  public.maintenance_records (id, vehicle_id, type, status, cost, scheduled_at, completed_at, notes)
values
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Engine',  'In Progress', 18400.00, (now() - interval '2 days')::date,  null, 'Coolant leak traced to water pump housing.'),
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Service', 'Scheduled',    6200.00, (now() + interval '5 days')::date,  null, '90 000 km major service due.'),
  ('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 'Tracker', 'Open',          950.00, (now() - interval '1 day')::date,   null, 'Unit not reporting since Tuesday.'),
  ('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Tyres',   'Completed',   14800.00, (now() - interval '10 days')::date, (now() - interval '9 days')::date, 'Replaced four drive-axle tyres.'),
  ('70000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'Licence', 'Overdue',      1450.00, (now() - interval '8 days')::date,  null, 'Licence disc renewal outstanding.'),
  ('70000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Brakes',  'Scheduled',    9300.00, (now() + interval '12 days')::date, null, 'Front brake pads at wear indicator.')
on conflict (id) do nothing;

-- Alerts --------------------------------------------------------------------
insert into
  public.alerts (id, vehicle_id, type, severity, status, message)
values
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'Tracker Offline',  'Critical', 'New',          'No GPS fix received for 51 hours.'),
  ('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'Breakdown Risk',   'Critical', 'Acknowledged', 'Engine temperature repeatedly above threshold.'),
  ('80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 'Licence Expiring', 'Warning',  'New',          'Licence disc expired 8 days ago.'),
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Service Due',      'Warning',  'New',          'Service interval reached in 5 days.'),
  ('80000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'High Idle Time',   'Info',     'Resolved',     'Idle time 22% above fleet average last week.')
on conflict (id) do nothing;

-- Customer messages ---------------------------------------------------------
insert into
  public.customer_messages (id, customer_id, sender_type, sender_id, body)
values
  ('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'customer', null, 'Can you confirm the ETA for the Kleinmond load? Site closes at 16:00.'),
  ('90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'customer', null, 'We dispute invoice 0004 — two loads were short delivered.'),
  ('90000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'staff',    null, 'POD for yesterday''s delivery has been uploaded to your portal.'),
  ('90000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'customer', null, 'Please quote for 12 loads of G5 base course in March.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CLEANUP — run this to remove every row above once real data goes in.
-- Order matters: children before parents.
--
--   delete from public.customer_messages    where id::text like '90000000-%';
--   delete from public.alerts               where id::text like '80000000-%';
--   delete from public.maintenance_records  where id::text like '70000000-%';
--   delete from public.invoices             where id::text like '60000000-%';
--   delete from public.quotes               where id::text like '50000000-%';
--   delete from public.jobs                 where id::text like '40000000-%';
--   update public.drivers set assigned_vehicle_id = null where id::text like '30000000-%';
--   delete from public.drivers              where id::text like '30000000-%';
--   delete from public.vehicles             where id::text like '20000000-%';
--   delete from public.customers            where id::text like '10000000-%';
-- ---------------------------------------------------------------------------
