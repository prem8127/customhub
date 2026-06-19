"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-6 py-16 text-center">
      <div className="premium-panel-strong rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-steel">CustomHub</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Something went wrong</h1>
        <p className="mt-4 text-sm leading-7 text-steel">
          The page could not finish loading. Try again or return to the storefront.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link href="/" className="rounded-full border border-line bg-white/70 px-6 py-3 text-sm font-semibold text-brand">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
