"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { request } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    setLoading(true);
    try {
      await request("/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-red-600">
          No reset token found. Please use the link from your email.
        </p>
        <Link href="/forgot-password" className="text-sm font-semibold text-brand underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-green-100">
          <KeyRound className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-ink">Password updated</h2>
        <p className="text-sm text-steel">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-semibold tracking-tight text-ink">Set new password</h2>
      <p className="mt-2 text-sm text-steel">Choose a strong password you haven&apos;t used before.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input w-full rounded-2xl px-4 py-3 outline-none"
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="premium-input w-full rounded-2xl px-4 py-3 outline-none"
            placeholder="Repeat password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto grid min-h-[72vh] max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <section className="premium-panel-dark flex min-h-[420px] flex-col justify-between rounded-[2rem] p-7 text-white">
        <div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight">
            Create a new password.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Your new password will be saved and all other sessions will be signed out.
          </p>
        </div>
      </section>

      <div className="premium-panel-strong mt-5 rounded-[2rem] p-6 lg:ml-5 lg:mt-0">
        <Suspense fallback={<p className="text-sm text-steel">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
