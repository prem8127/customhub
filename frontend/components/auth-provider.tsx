"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { AuthResponse, googleLogin, loginUser, logoutUser, refreshSession, registerUser } from "@/lib/api";
import { Address, UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  continueWithGoogle: () => void;
  handleGoogleCode: (code: string) => Promise<void>;
  logout: () => void;
  saveAddress: (address: Address) => void;
};

// Only persist user profile — NOT the access token (XSS risk)
const STORAGE_KEY = "customhub_session";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ⚠️  NEVER use window.location.origin for the redirect URI.
// Google blocks OAuth redirects to private IPs (192.168.x.x, 10.x.x.x).
// Always use the hardcoded env var — always localhost:3000 in dev,
// always your real domain in production.
const GOOGLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "http://localhost:3000/auth/google/callback";

function redirectToGoogle(currentPath: string) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Sign-In is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local"
    );
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,   // ← hardcoded, never from window
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: currentPath === "/login" ? "/account" : currentPath,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  function applyAuthResponse(response: AuthResponse) {
    setUser(response.user);
    setToken(response.accessToken ?? response.token);
    setRefreshToken(response.refreshToken ?? null);
  }

  // Load stored session — only user profile and refreshToken, never the access token
  useEffect(() => {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: UserProfile;
          refreshToken?: string;
        };
        setUser(parsed.user);
        setRefreshToken(parsed.refreshToken ?? null);
        // Access token is NOT restored from storage — we re-issue it via /refresh below
      } catch {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist session — store user + refreshToken only, skip the access token
  useEffect(() => {
    if (user) {
      globalThis.localStorage?.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, refreshToken })
      );
      return;
    }
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  }, [refreshToken, user]);

  // Auto-refresh access token when we have a refreshToken but no access token
  useEffect(() => {
    if (!refreshToken || token) return;
    void refreshSession(refreshToken)
      .then(applyAuthResponse)
      .catch(() => {
        setRefreshToken(null);
        setUser(null);
      });
  }, [refreshToken, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      refreshToken,
      login: async (payload) => {
        const response = await loginUser(payload);
        applyAuthResponse(response);
      },
      register: async (payload) => {
        const response = await registerUser(payload);
        applyAuthResponse(response);
      },
      // Redirects browser to Google — page will leave and come back at /auth/google/callback
      continueWithGoogle: () => {
        redirectToGoogle(window.location.pathname);
      },
      // Called by /auth/google/callback page after Google redirects back with ?code=
      handleGoogleCode: async (code: string) => {
        const response = await googleLogin({ code });
        applyAuthResponse(response);
      },
      logout: () => {
        void logoutUser(refreshToken ?? undefined);
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      },
      saveAddress: (address) => {
        setUser((current) =>
          current
            ? {
                ...current,
                addresses: [...current.addresses.filter((item) => item.id !== address.id), address],
              }
            : current
        );
      },
    }),
    [refreshToken, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
