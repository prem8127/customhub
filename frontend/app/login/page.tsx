"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, continueWithGoogle, user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      router.replace("/account");
    } catch {
      setError(mode === "login" ? "Invalid email or password." : "Unable to create account. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setError("");
    try {
      continueWithGoogle(); // redirects to Google — page will navigate away
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
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
            Sign in or create your customer profile.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Save addresses, review order history, manage cart items, and checkout faster.
          </p>
        </div>
      </section>

      <div className="premium-panel-strong mt-5 rounded-[2rem] p-6 lg:ml-5 lg:mt-0">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {mode === "login" ? "Customer login" : "Create customer account"}
        </h2>
        <div className="mt-6 flex gap-2">
          {(["login", "signup"] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => { setMode(nextMode); setError(""); }}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                mode === nextMode ? "bg-brand text-white" : "bg-white text-brand"
              }`}
            >
              {nextMode === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="premium-input w-full rounded-2xl px-4 py-3 outline-none"
                placeholder="Your full name"
                suppressHydrationWarning
                required
              />
            </label>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Email</span>
            <div className="premium-input flex items-center gap-3 rounded-2xl px-4 py-3">
              <Mail className="h-4 w-4 text-steel" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="you@example.com"
                suppressHydrationWarning
                required
              />
            </div>
          </label>
          <label className="block space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand">Password</span>
              {mode === "login" && (
                <Link href="/forgot-password" className="text-xs text-steel underline underline-offset-2 hover:text-brand">
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="premium-input w-full rounded-2xl px-4 py-3 outline-none"
              placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
              minLength={mode === "signup" ? 8 : undefined}
              suppressHydrationWarning
              required
            />
          </label>
          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-steel">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          suppressHydrationWarning
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.314 0-9.626-3.328-11.29-7.985l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303a11.994 11.994 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.801 44 34.5 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
          Continue with Google
        </button>

        {mode === "login" && (
          <p className="mt-4 text-center text-xs text-steel">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => setMode("signup")} className="font-semibold text-brand underline underline-offset-2">
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
