-- Postgres requires BOTH a table-level GRANT and a permissive RLS policy
-- before a row is readable or writable: policies filter rows, they do not
-- confer privileges. Without the grants below every PostgREST request fails
-- with 42501 "permission denied" no matter how the policies in 0002 are
-- written.
--
-- `anon` is deliberately granted nothing. Every table in this app requires
-- an authenticated principal, so unauthenticated requests are rejected at
-- the privilege level rather than quietly returning an empty result.

grant usage on schema public to anon,
authenticated,
service_role;

grant
select
,
  insert,
update,
delete on all tables in schema public to authenticated;

grant all on all tables in schema public to service_role;

grant usage,
select
  on all sequences in schema public to authenticated,
  service_role;

-- current_role() / current_driver_id() / current_customer_id() are called
-- from inside the RLS policies, so the querying role needs EXECUTE.
grant
execute on all functions in schema public to authenticated,
service_role;

-- Applies to anything added by later migrations, so this does not have to
-- be repeated every time a table is created.
alter default privileges in schema public grant
select
,
  insert,
update,
delete on tables to authenticated;

alter default privileges in schema public grant all on tables to service_role;

alter default privileges in schema public grant
execute on functions to authenticated,
service_role;
