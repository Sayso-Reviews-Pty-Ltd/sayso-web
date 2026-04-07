"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useEventPrefetch(href: string, index: number) {
  const router = useRouter();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefetch destination route on mount for the first visible cards.
  useEffect(() => {
    if (index > 1) return;
    if (typeof window === "undefined") return;

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const prefetch = () => {
      try {
        router.prefetch(href);
      } catch {
        // Ignore prefetch failures.
      }
    };

    const idleCallback = (window as any).requestIdleCallback;
    if (typeof idleCallback === "function") {
      idleId = idleCallback(prefetch, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(prefetch, 200);
    }

    return () => {
      if (idleId !== null && typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [href, index, router]);

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      try {
        router.prefetch(href);
      } catch {
        // Ignore hover prefetch failures.
      }
    }, 100);
  };

  const handleCardMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardTouchStart = () => {
    try {
      router.prefetch(href);
    } catch {
      // Ignore touch-intent prefetch failures.
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return { handleCardMouseEnter, handleCardMouseLeave, handleCardTouchStart };
}
