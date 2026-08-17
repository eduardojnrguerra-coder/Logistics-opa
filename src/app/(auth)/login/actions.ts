"use server";

import { redirect } from "next/navigation";
import { resolveHomePath } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function loginWithPassword(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  // Staff, drivers, and customers all sign in here but belong in different
  // parts of the app.
  redirect(await resolveHomePath());
}

export type MagicLinkState = { error: string | null; sent: boolean };

// Used by the driver/customer portal login flow instead of a password.
// Supabase will only actually send an email for an address that already
// has an auth.users record — accounts are provisioned by staff invite, not
// self-signup, so this is safe to expose without a pre-check.
export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter your email.", sent: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    return { error: "Could not send a login link. Try again.", sent: false };
  }

  return { error: null, sent: true };
}
