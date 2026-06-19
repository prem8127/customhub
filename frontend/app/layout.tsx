import type { Metadata } from "next";
import { Suspense } from "react";

import { BackendStatusBanner } from "@/components/backend-status-banner";
import { AppTransitionShell } from "@/components/app-transition-shell";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "CustomHub",
  description: "Premium Apple-inspired custom commerce for elevated merch and accessories."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <BackendStatusBanner />
          <CartProvider>
            <Suspense fallback={null}>
              <AppTransitionShell>{children}</AppTransitionShell>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
