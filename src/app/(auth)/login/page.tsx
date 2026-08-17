"use client";

import { useActionState, useState } from "react";
import { loginWithPassword, sendMagicLink, type LoginState, type MagicLinkState } from "./actions";

const initialLoginState: LoginState = { error: null };
const initialMagicLinkState: MagicLinkState = { error: null, sent: false };

export default function LoginPage() {
  const [mode, setMode] = useState<"staff" | "portal">("staff");
  const [loginState, loginAction, loginPending] = useActionState(loginWithPassword, initialLoginState);
  const [magicLinkState, magicLinkAction, magicLinkPending] = useActionState(
    sendMagicLink,
    initialMagicLinkState,
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Sign in</h1>

      <div className="mt-4 flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setMode("staff")}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${
            mode === "staff"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Staff
        </button>
        <button
          type="button"
          onClick={() => setMode("portal")}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${
            mode === "portal"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Driver / Customer
        </button>
      </div>

      {mode === "staff" ? (
        <form action={loginAction} className="mt-6 space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          {loginState.error && <p className="text-sm text-red-600 dark:text-red-400">{loginState.error}</p>}
          <SubmitButton pending={loginPending} label="Sign in" pendingLabel="Signing in…" />
        </form>
      ) : (
        <form action={magicLinkAction} className="mt-6 space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enter the email your dispatcher or account manager invited you with. We&rsquo;ll email you a sign-in
            link.
          </p>
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          {magicLinkState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{magicLinkState.error}</p>
          )}
          {magicLinkState.sent && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Check your inbox for a sign-in link.
            </p>
          )}
          <SubmitButton pending={magicLinkPending} label="Send sign-in link" pendingLabel="Sending…" />
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
      />
    </label>
  );
}

function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
