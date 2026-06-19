"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function AdminLoginView() {
  const router = useRouter();
  const { login, token, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [router, token, user?.role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
    } catch {
      setError("Invalid admin credentials.");
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
            Sign in to the admin control center.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Manage products, categories, and store operations from one secure admin profile.
          </p>
        </div>
        <Link href="/" className="mt-8 w-fit rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/80">
          Back to store
        </Link>
      </section>

      <form onSubmit={handleSubmit} className="premium-panel-strong mt-5 rounded-[2rem] p-6 lg:ml-5 lg:mt-0">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Admin login</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-steel">
          Enter your admin credentials to continue. Only accounts with the admin role can access this area.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Email</span>
            <div className="premium-input flex items-center gap-3 rounded-2xl px-4 py-3">
              <Mail className="h-4 w-4 text-steel" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="admin@customhub.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="premium-input w-full rounded-2xl px-4 py-3 outline-none"
              placeholder="Admin password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}