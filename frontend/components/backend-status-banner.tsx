"use client";

// Shows a subtle banner when the backend API can't be reached.
// Disappears automatically once the backend comes online.
import { useEffect, useState } from "react";

export function BackendStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

    async function check() {
      try {
        await fetch(`${apiUrl}/health`, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });
        setOffline(false);
      } catch {
        setOffline(true);
      }
    }

    void check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-3 shadow-lg text-sm text-amber-900"
    >
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      Backend server is not running — start it with{" "}
      <code className="font-mono font-semibold">cd backend &amp;&amp; npm run dev</code>
    </div>
  );
}
