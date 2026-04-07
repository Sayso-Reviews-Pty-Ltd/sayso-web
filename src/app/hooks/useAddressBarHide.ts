"use client";

import { useEffect, useCallback, useRef } from "react";

export function useAddressBarHide() {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const setViewportHeight = useCallback(() => {
    // Set CSS custom property for dynamic viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    // Set additional viewport variables for better mobile support
    document.documentElement.style.setProperty("--window-height", `${window.innerHeight}px`);
    document.documentElement.style.setProperty("--window-width", `${window.innerWidth}px`);
  }, []);

  const detectMobile = useCallback(() => {
    const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isMobile = window.innerWidth <= 768 || "ontouchstart" in window;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    return { isIOS, isMobile, isStandalone };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { isIOS, isMobile, isStandalone } = detectMobile();

    if (!isMobile || isStandalone) return;

    // Set initial viewport height
    setViewportHeight();

    // iOS only: Set body height once without scroll manipulation
    if (isIOS) {
      const body = document.body;
      if (body && !body.style.height) {
        body.style.height = "100vh";
        body.style.height = "-webkit-fill-available";
      }
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);

          // Only update viewport height on significant scroll changes (passive approach)
          if (scrollDelta > 50) {
            setViewportHeight();
          }

          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }

      // Update viewport height on scroll end for better accuracy
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setViewportHeight();
      }, 150);
    };

    const handleResize = () => {
      setViewportHeight();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile && !isStandalone) {
        setViewportHeight();
      }
    };

    // Event listeners with passive flag for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(scrollTimeoutRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [detectMobile, setViewportHeight]);
}
