import { useEffect, useMemo, useState } from "react";

function isIOSBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;
  const isIPadOS = platform === "MacIntel" && maxTouchPoints > 1;
  return /iPad|iPhone|iPod/i.test(ua) || isIPadOS;
}

export function useHomeHeroReadiness() {
  const isIOS = useMemo(() => isIOSBrowser(), []);
  // Start false so server and client render the same markup; enable after mount.
  const [heroReady, setHeroReady] = useState(false);

  // iOS WebKit tends to be more sensitive to large above-the-fold image/animation work.
  // Defer mounting HeroCarousel until idle or first interaction to avoid "Can't open this page" crashes.
  useEffect(() => {
    if (!isIOS) {
      setHeroReady(true);
      return;
    }
    if (heroReady) return;

    let didSet = false;
    let idleId: number | null = null;
    let delayId: number | null = null;
    const cleanupFns: Array<() => void> = [];

    const markReady = () => {
      if (didSet) return;
      didSet = true;
      setHeroReady(true);
      cleanupFns.forEach((fn) => fn());
      cleanupFns.length = 0;
    };

    const onInteract = () => markReady();

    // Interaction signals: scroll/tap/click.
    window.addEventListener("touchstart", onInteract, { passive: true, once: true });
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("scroll", onInteract, { passive: true, once: true });
    cleanupFns.push(() => window.removeEventListener("touchstart", onInteract));
    cleanupFns.push(() => window.removeEventListener("pointerdown", onInteract));
    cleanupFns.push(() => window.removeEventListener("scroll", onInteract));

    const scheduleIdle = () => {
      const anyWindow = window as any;
      if (typeof anyWindow.requestIdleCallback === "function") {
        // Reduced timeout from 1200ms to 300ms for faster perceived load
        idleId = anyWindow.requestIdleCallback(() => markReady(), { timeout: 300 });
        cleanupFns.push(() => anyWindow.cancelIdleCallback?.(idleId));
      } else {
        // Reduced delay from 1200ms to 300ms
        delayId = window.setTimeout(() => markReady(), 300);
        cleanupFns.push(() => delayId != null && clearTimeout(delayId));
      }
    };

    // Start immediately instead of waiting 100ms
    scheduleIdle();

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [isIOS, heroReady]);

  return { heroReady };
}
