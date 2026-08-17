import "server-only";
import { createClient } from "@/lib/supabase/server";

// Every query here runs as the signed-in user, so RLS decides what comes
// back. A dispatcher and a driver calling listJobs() get different rows from
// the same code path — the filtering is in the database, not in these
// functions (see supabase/migrations/0002_rls_policies.sql).

export const ACTIVE_JOB_STATUSES = [
  "Dispatched",
  "At Pickup",
  "Loaded",
  "On Route",
  "At Dropoff",
  "Delayed",
];

const OPEN_INVOICE_STATUSES = ["Sent", "Part Paid", "Overdue"];

export async function listJobs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, status, priority, pickup_address, dropoff_address, scheduled_at, delivered_at, customers(name), drivers(name), vehicles(registration)",
    )
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listVehicles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, registration, name, type, status, tracking_provider")
    .order("registration");
  if (error) throw error;
  return data;
}

export async function listDrivers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("id, name, phone, status, vehicles(registration)")
    .order("name");
  if (error) throw error;
  return data;
}

export async function listCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, contact_name, email, phone, status, risk_level, customer_type")
    .order("name");
  if (error) throw error;
  return data;
}

export async function listInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, job_id, status, amount, currency, due_date, paid_at, customers(name)")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, status, amount, currency, valid_until, customers(name)")
    .order("valid_until", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMaintenance() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_records")
    .select("id, type, status, cost, scheduled_at, completed_at, notes, vehicles(registration)")
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAlerts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, type, severity, status, message, vehicles(registration)")
    .neq("status", "Resolved")
    .order("severity");
  if (error) throw error;
  return data;
}

export type DashboardSummary = {
  activeJobs: number;
  delayedJobs: number;
  vehiclesTotal: number;
  vehiclesOffRoad: number;
  driversOnDuty: number;
  outstandingValue: number;
  overdueValue: number;
  overdueCount: number;
  openAlerts: number;
};

// Counts are computed with head:true count queries rather than fetching rows
// and measuring array length, so the dashboard stays cheap as tables grow.
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  const [activeJobs, delayedJobs, vehicles, offRoad, onDuty, openInvoices, alerts] =
    await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", ACTIVE_JOB_STATUSES),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "Delayed"),
      supabase.from("vehicles").select("id", { count: "exact", head: true }),
      supabase.from("vehicles").select("id", { count: "exact", head: true }).in("status", ["Maintenance", "Offline"]),
      supabase.from("drivers").select("id", { count: "exact", head: true }).eq("status", "On Duty"),
      supabase.from("invoices").select("amount, status, due_date").in("status", OPEN_INVOICE_STATUSES),
      supabase.from("alerts").select("id", { count: "exact", head: true }).neq("status", "Resolved"),
    ]);

  const invoices = openInvoices.data ?? [];
  const overdue = invoices.filter((invoice) => invoice.status === "Overdue");

  return {
    activeJobs: activeJobs.count ?? 0,
    delayedJobs: delayedJobs.count ?? 0,
    vehiclesTotal: vehicles.count ?? 0,
    vehiclesOffRoad: offRoad.count ?? 0,
    driversOnDuty: onDuty.count ?? 0,
    outstandingValue: invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0),
    overdueValue: overdue.reduce((sum, invoice) => sum + Number(invoice.amount), 0),
    overdueCount: overdue.length,
    openAlerts: alerts.count ?? 0,
  };
}

export async function listActiveJobs(limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, status, priority, dropoff_address, customers(name), drivers(name), vehicles(registration)")
    .in("status", ACTIVE_JOB_STATUSES)
    .order("scheduled_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

// --- portal-scoped queries -------------------------------------------------
// These deliberately carry no driver_id / customer_id filter: RLS resolves
// the caller's own identity, so a portal user cannot widen the result set by
// tampering with a request.

export async function listMyDriverJobs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, status, priority, pickup_address, dropoff_address, scheduled_at, delivered_at, customers(name), vehicles(registration)")
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMyCustomerJobs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, status, pickup_address, dropoff_address, scheduled_at, delivered_at")
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMyCustomerInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, status, amount, currency, due_date, paid_at")
    .order("due_date", { ascending: false });
  if (error) throw error;
  return data;
}
