"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { request } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await request("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[72vh] max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <section className="premium-panel-dark flex min-h-[420px] flex-col justify-between rounded-[2rem] p-7 text-white">
        <div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight">
            Forgot your password?
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>
      </section>

      <div className="premium-panel-strong mt-5 rounded-[2rem] p-6 lg:ml-5 lg:mt-0">
        {sent ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-ink">Check your inbox</h2>
            <p className="max-w-sm text-sm text-steel">
              If that email is registered, a reset link has been sent. Check your spam folder
              if you don&apos;t see it within a minute.
            </p>
            <Link
              href="/login"
              className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Reset password</h2>
            <p className="mt-2 text-sm text-steel">We&apos;ll email you a secure reset link.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand">Email</span>
                <div className="premium-input flex items-center gap-3 rounded-2xl px-4 py-3">
                  <Mail className="h-4 w-4 text-steel" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-steel">
              Remember it?{" "}
              <Link href="/login" className="font-semibold text-brand underline underline-offset-2">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
