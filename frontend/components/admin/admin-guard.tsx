"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [router, token, user?.role]);

  if (!token || user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-steel">Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-ink">Checking access...</h1>
      </div>
    );
  }

  return <>{children}</>;
}
