-- ---------------------------------------------------------------------------
-- ONE-TIME PRODUCTION BOOTSTRAP
--
-- seed.sql never runs against a hosted project, so a freshly migrated
-- database has no profiles rows at all. Until one exists, current_role()
-- returns null for everybody and every RLS policy denies every read — the
-- app will look broken because nobody is anybody yet.
--
-- This promotes an existing auth user to Owner/Admin. Run it once, in the
-- Supabase SQL editor, after creating your own user.
--
-- Steps:
--   1. Supabase dashboard -> Authentication -> Users -> Add user.
--      Use your real email and a strong password. Tick "Auto Confirm User".
--      The password is set there and never appears in this repository.
--   2. Replace the two placeholders below with your details.
--   3. Run this script.
--   4. Sign in to the deployed app. Create everyone else from Settings, so
--      this script is never needed again.
-- ---------------------------------------------------------------------------
insert into
  public.profiles (id, full_name, email, role, active)
select
  id,
  'YOUR NAME HERE', -- <- replace
  email,
  'owner_admin',
  true
from
  auth.users
where
  email = 'you@yourbusiness.com' -- <- replace
on conflict (id) do update
set
  role = 'owner_admin',
  active = true;

-- Singleton business profile. The app falls back to the NEXT_PUBLIC_* env
-- vars when this row is missing, but creating it means Settings has
-- something to edit.
insert into
  public.business_settings (
    id,
    business_name,
    currency_code,
    locale,
    contact_email
  )
values
  (
    1,
    'YOUR BUSINESS NAME', -- <- replace
    'ZAR',
    'en-ZA',
    'you@yourbusiness.com' -- <- replace
  )
on conflict (id) do nothing;

-- Confirm it worked: this should return exactly one owner_admin row.
select
  full_name,
  email,
  role,
  active
from
  public.profiles
where
  role = 'owner_admin';
