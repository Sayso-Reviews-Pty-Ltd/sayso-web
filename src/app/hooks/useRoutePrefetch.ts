"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

interface UseRoutePrefetchOptions {
  /**
   * Milliseconds to wait before running prefetch when
   * requestIdleCallback is unavailable.
   */
  delay?: number;
}

const DEFAULT_DELAY = 150;

/**
 * Prefetch a list of routes once the browser is idle so future navigations
 * feel instant. Meant for high-traffic destinations (e.g. /for-you, /trending).
 */
export function useRoutePrefetch(
  routes: string[],
  { delay = DEFAULT_DELAY }: UseRoutePrefetchOptions = {}
) {
  const router = useRouter();

  const signature = useMemo(
    () =>
      routes
        .filter(Boolean)
        .filter((route) => route.startsWith("/"))
        .join("|"),
    [routes]
  );

  const stableRoutes = useMemo(
    () =>
      Array.from(
        new Set(
          routes.filter(Boolean).filter((route) => route.startsWith("/")) // only internal routes
        )
      ),
    [signature]
  );

  useEffect(() => {
    if (stableRoutes.length === 0) return;
    if (typeof router.prefetch !== "function") return;
    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const prefetchRoutes = () => {
      if (cancelled) return;
      stableRoutes.forEach((route) => {
        try {
          const maybePromise = router.prefetch(route);
          if (typeof (maybePromise as unknown as Promise<unknown>)?.catch === "function") {
            (maybePromise as unknown as Promise<unknown>).catch(() => {
              // Silently ignore failures (e.g., dynamic routes without data yet)
            });
          }
        } catch {
          // Ignore synchronous errors (e.g., route not available yet)
        }
      });
    };

    const schedulePrefetch = () => {
      if (typeof window === "undefined") return;
      const idleCallback = (window as any).requestIdleCallback;
      if (typeof idleCallback === "function") {
        idleId = idleCallback(prefetchRoutes, { timeout: 1000 });
      } else {
        timeoutId = window.setTimeout(prefetchRoutes, delay);
      }
    };

    schedulePrefetch();

    return () => {
      cancelled = true;
      if (typeof window === "undefined") return;
      if (idleId !== null && typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [router, stableRoutes, delay, signature]);
}
