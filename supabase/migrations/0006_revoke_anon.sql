-- 0003 granted privileges to authenticated and service_role but never said
-- anything about anon, on the assumption that anon simply holds nothing.
--
-- That assumption is not safe on a hosted project. Supabase's "Automatically
-- expose new tables" setting grants the Data API roles — anon included —
-- privileges on tables as they are created, so a table created by a
-- migration can end up readable by unauthenticated callers.
--
-- RLS would still deny the rows, because every policy resolves through
-- current_role(), current_driver_id(), or current_customer_id(), all of
-- which are null for anon. But that leaves a single control standing between
-- an anonymous request and the data. Revoking outright means unauthenticated
-- traffic is refused at the privilege level, before any policy is consulted,
-- and stays refused whatever that project setting is later flipped to.
revoke all on all tables in schema public
from
  anon;

revoke all on all sequences in schema public
from
  anon;

revoke all on all functions in schema public
from
  anon;

alter default privileges in schema public
revoke all on tables
from
  anon;

alter default privileges in schema public
revoke all on sequences
from
  anon;

-- anon keeps USAGE on the schema itself: GoTrue needs to resolve the schema
-- to serve sign-in, and the table-level revokes above are what actually deny
-- the data.
