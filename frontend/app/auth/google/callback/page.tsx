"use client";

// Google redirects here after the user approves sign-in:
//   http://localhost:3000/auth/google/callback?code=4/0AXxx...&state=/account
//
// IMPORTANT: This page must always be opened via localhost:3000 — never via
// a private IP (192.168.x.x). Open your app at http://localhost:3000.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { handleGoogleCode } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state") ?? "/account";
    const errorParam = params.get("error");

    if (errorParam) {
      setError("Google sign-in was cancelled or denied.");
      setTimeout(() => router.replace("/login"), 2500);
      return;
    }

    if (!code) {
      setError("No authorisation code received from Google.");
      setTimeout(() => router.replace("/login"), 2500);
      return;
    }

    handleGoogleCode(code)
      .then(() => router.replace(state))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Google sign-in failed.";
        setError(message);
        setTimeout(() => router.replace("/login"), 3000);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        gap: "14px",
        color: "#444",
      }}
    >
      {error ? (
        <>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p style={{ fontSize: "15px", color: "#e24b4a" }}>{error}</p>
          <p style={{ fontSize: "13px", color: "#888" }}>Redirecting you back to login…</p>
        </>
      ) : (
        <>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.314 0-9.626-3.328-11.29-7.985l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303a11.994 11.994 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.801 44 34.5 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
          <p style={{ fontSize: "15px" }}>Completing sign-in…</p>
        </>
      )}
    </div>
  );
}
