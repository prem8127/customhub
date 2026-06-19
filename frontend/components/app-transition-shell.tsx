"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { GlobalLoader } from "@/components/global-loader";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const INITIAL_LOADER_MS = 700;
const NAVIGATION_LOADER_MS = 250;

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function AppTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeSignature = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const pendingNavigationRef = useRef<string | null>(null);
  const transitionStartRef = useRef(Date.now());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      setContentVisible(true);
      setLoaderVisible(false);
      initialLoadRef.current = false;
    }, INITIAL_LOADER_MS);

    return () => window.clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (!isPlainLeftClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.dataset.skipRouteLoader === "true") {
        pendingNavigationRef.current = null;
        setContentVisible(true);
        setLoaderVisible(false);
        return;
      }

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      const nextSignature = `${nextUrl.pathname}${nextUrl.search}`;
      const currentSignature = `${currentUrl.pathname}${currentUrl.search}`;

      if (nextSignature === currentSignature) {
        return;
      }

      pendingNavigationRef.current = nextSignature;
      transitionStartRef.current = Date.now();
      setContentVisible(false);
      setLoaderVisible(true);
    };

    const onPopState = () => {
      pendingNavigationRef.current = null;
      setContentVisible(true);
      setLoaderVisible(false);
    };

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (initialLoadRef.current || pendingNavigationRef.current === null) {
      return;
    }

    const elapsed = Date.now() - transitionStartRef.current;
    const remaining = Math.max(0, NAVIGATION_LOADER_MS - elapsed);

    const settleTimer = window.setTimeout(() => {
      setContentVisible(true);
      setLoaderVisible(false);
      pendingNavigationRef.current = null;
    }, remaining);

    return () => window.clearTimeout(settleTimer);
  }, [routeSignature]);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {loaderVisible ? (
          <motion.div
            key="global-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlobalLoader />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-screen"
      >
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MobileNav />
      </motion.div>
    </div>
  );
}
