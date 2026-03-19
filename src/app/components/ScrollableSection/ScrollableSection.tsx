"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Default visible card count - matches BusinessRowSkeleton default
// This represents the typical number of cards visible in the viewport before scrolling
export const DEFAULT_VISIBLE_CARD_COUNT = 4;

interface ScrollableSectionProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  arrowColor?: string;
  enableMobilePeek?: boolean;
  hideArrowsOnDesktop?: boolean;
  mobileTrailingSpacerClassName?: string;
}

export default function ScrollableSection({
  children,
  className = "",
  showArrows = true,
  arrowColor = "text-charcoal/60",
  enableMobilePeek = false,
  hideArrowsOnDesktop = false,
  mobileTrailingSpacerClassName = "w-4",
}: ScrollableSectionProps) {
  const pathname = usePathname();
  const isHomeRoute = pathname === "/" || pathname.startsWith("/home");
  const shouldEnableMobilePeek = enableMobilePeek || isHomeRoute;
  const arrowVisibilityClass = [
    shouldEnableMobilePeek ? "hidden sm:flex" : "flex",
    hideArrowsOnDesktop ? "lg:hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const previousScrollLeftRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const settleSnapTimeoutRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  const getMobileSnapTargets = (container: HTMLDivElement) =>
    Array.from(
      container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
    );

  const getNearestSnapTargetIndex = (
    container: HTMLDivElement,
    snapTargets: HTMLElement[]
  ) => {
    if (snapTargets.length === 0) return -1;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < snapTargets.length; index += 1) {
      const target = snapTargets[index];
      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      const distance = Math.abs(targetCenter - containerCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    return nearestIndex;
  };

  const centerSnapTarget = (
    container: HTMLDivElement,
    target: HTMLElement,
    behavior: ScrollBehavior
  ) => {
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const centeredLeft = target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
    const clampedLeft = Math.min(maxScrollLeft, Math.max(0, centeredLeft));
    if (Math.abs(container.scrollLeft - clampedLeft) <= 1) return;
    container.scrollTo({ left: clampedLeft, behavior });
  };

  const snapToNearestTarget = (behavior: ScrollBehavior = "auto") => {
    const container = scrollRef.current;
    if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) return;

    const snapTargets = getMobileSnapTargets(container);
    if (snapTargets.length === 0) return;

    const nearestIndex = getNearestSnapTargetIndex(container, snapTargets);
    if (nearestIndex < 0) return;
    centerSnapTarget(container, snapTargets[nearestIndex], behavior);
  };

  // Continuously interpolates scale and opacity for every snap-target card based on
  // its distance from the scroll-container's center. Called via rAF on every scroll
  // frame so the effect is driven purely by position — no CSS transition lag.
  const updateCardScaleOpacity = () => {
    const container = scrollRef.current;

    // Off-mobile or non-peek rows: clear any previously applied styles.
    if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) {
      if (container) {
        container
          .querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
          .forEach((el) => {
            el.style.transform = '';
            el.style.opacity = '';
          });
      }
      return;
    }

    const snapTargets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
    );
    if (snapTargets.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    // Cards whose center is beyond this distance clamp to minimum scale/opacity.
    const maxDistance = container.clientWidth * 0.55;

    for (const el of snapTargets) {
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      const progress = Math.max(0, 1 - distance / maxDistance); // 0 = edge, 1 = centered

      if (reducedMotion) {
        el.style.transform = '';
        el.style.opacity = progress > 0.5 ? '1' : '0.75';
      } else {
        el.style.transform = `scale(${(0.92 + progress * 0.08).toFixed(3)})`;
        el.style.opacity = (0.70 + progress * 0.30).toFixed(3);
      }
    }
  };

  const scheduleCardScaleUpdate = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      updateCardScaleOpacity();
    });
  };

  const syncMobileSnapTargets = () => {
    const container = scrollRef.current;
    if (!container) return;

    const snapTargets = Array.from(container.querySelectorAll<HTMLElement>(".snap-start"));
    if (snapTargets.length === 0) return;

    for (const target of snapTargets) {
      target.removeAttribute("data-mobile-snap-target");
    }

    for (const target of snapTargets) {
      const ancestorSnapTarget = target.parentElement?.closest(".snap-start");
      const isTopLevelSnapTarget = !ancestorSnapTarget || !container.contains(ancestorSnapTarget);
      if (isTopLevelSnapTarget) {
        target.setAttribute("data-mobile-snap-target", "true");
      }
    }

    scheduleCardScaleUpdate();
  };

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScrollLeft = scrollWidth - clientWidth;

    setCanScrollRight(maxScrollLeft > 5);
    setCanScrollLeft(scrollLeft > 5);
    setShowRightArrow(scrollLeft < maxScrollLeft - 10);
    setShowLeftArrow(scrollLeft > 10);

    previousScrollLeftRef.current = scrollLeft;
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    previousScrollLeftRef.current = scrollElement.scrollLeft;
    syncMobileSnapTargets();

    checkScrollPosition();

    const handleScroll = () => {
      checkScrollPosition();
      scheduleCardScaleUpdate();
      if (!isPointerDownRef.current && shouldEnableMobilePeek && window.innerWidth < 640) {
        if (settleSnapTimeoutRef.current !== null) {
          window.clearTimeout(settleSnapTimeoutRef.current);
        }
        settleSnapTimeoutRef.current = window.setTimeout(() => {
          snapToNearestTarget("auto");
        }, 90);
      }
    };
    const handlePointerDown = () => {
      isPointerDownRef.current = true;
      if (settleSnapTimeoutRef.current !== null) {
        window.clearTimeout(settleSnapTimeoutRef.current);
        settleSnapTimeoutRef.current = null;
      }
    };
    const handlePointerUp = () => {
      isPointerDownRef.current = false;
      if (shouldEnableMobilePeek && window.innerWidth < 640) {
        window.setTimeout(() => {
          snapToNearestTarget("smooth");
        }, 40);
      }
    };
    const handleScrollEnd = () => {
      if (!isPointerDownRef.current) {
        snapToNearestTarget("auto");
      }
    };
    const handleResize = () => {
      syncMobileSnapTargets();
      checkScrollPosition();
      // Immediately reset or recalculate styles — don't wait for next scroll.
      updateCardScaleOpacity();
      snapToNearestTarget("auto");
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    scrollElement.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    scrollElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    scrollElement.addEventListener("touchend", handlePointerUp, { passive: true });
    scrollElement.addEventListener("touchcancel", handlePointerUp, { passive: true });
    scrollElement.addEventListener("scrollend", handleScrollEnd as EventListener);
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
    });
    resizeObserver.observe(scrollElement);

    // Catch cards added asynchronously (Framer Motion stagger, dynamic imports, async data).
    // Observe childList only — NOT attributes, to avoid an infinite loop caused by
    // syncMobileSnapTargets itself setting data-mobile-snap-target.
    const mutationObserver = new MutationObserver(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
    });
    mutationObserver.observe(scrollElement, { childList: true, subtree: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      scrollElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      scrollElement.removeEventListener("touchstart", handlePointerDown);
      scrollElement.removeEventListener("touchend", handlePointerUp);
      scrollElement.removeEventListener("touchcancel", handlePointerUp);
      scrollElement.removeEventListener("scrollend", handleScrollEnd as EventListener);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (settleSnapTimeoutRef.current !== null) {
        window.clearTimeout(settleSnapTimeoutRef.current);
      }
    };
  }, [shouldEnableMobilePeek]);

  // Rows often populate asynchronously (fetch + dynamic imports).
  // Re-measure after children settle so mobile hint visibility is accurate.
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
      updateCardScaleOpacity();
    });
    const timeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
      updateCardScaleOpacity();
    }, 120);
    const lateTimeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
      updateCardScaleOpacity();
    }, 360);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(lateTimeoutId);
    };
  }, [children, className, shouldEnableMobilePeek]);

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (isMobile) {
      // Determine nearest card first, then move one card forward.
      const snapTargets = getMobileSnapTargets(container);
      if (snapTargets.length === 0) return;
      const currentIndex = getNearestSnapTargetIndex(container, snapTargets);
      const nextIndex = Math.min(currentIndex + 1, snapTargets.length - 1);
      const next = snapTargets[nextIndex];
      if (next && nextIndex !== currentIndex) {
        centerSnapTarget(container, next, "smooth");
      } else {
        container.scrollTo({ left: container.scrollLeft + container.clientWidth, behavior: "smooth" });
      }
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12; // gap-3 on sm+
      container.scrollLeft += cardWidth + gap;
    }
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (isMobile) {
      // Determine nearest card first, then move one card backward.
      const snapTargets = getMobileSnapTargets(container);
      if (snapTargets.length === 0) return;
      const currentIndex = getNearestSnapTargetIndex(container, snapTargets);
      const prevIndex = Math.max(currentIndex - 1, 0);
      const prev = snapTargets[prevIndex];
      if (prev && prevIndex !== currentIndex) {
        centerSnapTarget(container, prev, "smooth");
      } else {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12; // gap-3 on sm+
      container.scrollLeft -= cardWidth + gap;
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`horizontal-scroll scrollbar-hide scrollable-mobile-center flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:snap-mandatory ${className}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          overscrollBehaviorY: 'auto',
          touchAction: 'pan-x pan-y',
          scrollSnapType: 'x mandatory',
        } as React.CSSProperties}
      >
        {children}
        {/* Trailing spacer: closes the right-edge gap on the last card so it doesn't peek into the next section */}
        {shouldEnableMobilePeek && (
          <div className={`flex-shrink-0 ${mobileTrailingSpacerClassName} sm:hidden`} aria-hidden="true" />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 639px) {
          .scrollable-mobile-center :global(.snap-start[data-mobile-snap-target="true"]) {
            scroll-snap-align: center !important;
            scroll-snap-stop: always !important;
          }

          .scrollable-mobile-center :global(.snap-start:not([data-mobile-snap-target="true"])) {
            scroll-snap-align: none !important;
            scroll-snap-stop: normal !important;
          }

          /* Scroll-driven scale+opacity: inline styles are set via rAF on each scroll frame.
             will-change promotes cards to their own compositor layer for 60fps updates. */
          .scrollable-mobile-center :global([data-mobile-snap-target="true"]) {
            will-change: transform, opacity;
          }
        }
      `}</style>


      {showArrows && (
        <>
          {canScrollLeft && showLeftArrow && (
            <button
              onClick={scrollLeft}
              className={`
                scroll-arrow scroll-arrow-left
                absolute left-2 top-1/2 -translate-y-1/2 z-40
                w-14 h-14 sm:w-12 sm:h-12
                bg-navbar-bg
                rounded-full
                ${arrowVisibilityClass} items-center justify-center
                transition-all duration-300 ease-out
                active:scale-95
                text-white
                touch-manipulation
                /* Neomorphic styling for mobile */
                shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(139,176,138,0.3)]
                sm:shadow-lg
                hover:bg-card-bg hover:shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(139,176,138,0.4)]
                sm:hover:shadow-xl
                active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(139,176,138,0.3)]
                sm:active:shadow-lg
                border border-sage/20
              `}
              aria-label="Scroll left"
            >
              <svg
                className="w-5 h-5 sm:w-5 sm:h-5 rotate-180 arrow-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          {canScrollRight && showRightArrow && (
            <button
              onClick={scrollRight}
              className={`
                scroll-arrow scroll-arrow-right
                absolute right-2 top-1/2 -translate-y-1/2 z-40
                w-14 h-14 sm:w-12 sm:h-12
                bg-navbar-bg
                rounded-full
                ${arrowVisibilityClass} items-center justify-center
                transition-all duration-300 ease-out
                active:scale-95
                text-white
                touch-manipulation
                /* Neomorphic styling for mobile */
                shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(139,176,138,0.3)]
                sm:shadow-lg
                hover:bg-card-bg hover:shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(139,176,138,0.4)]
                sm:hover:shadow-xl
                active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(139,176,138,0.3)]
                sm:active:shadow-lg
                border border-sage/20
              `}
              aria-label="Scroll right"
            >
              <svg
                className="w-5 h-5 sm:w-5 sm:h-5 arrow-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </>
      )}

    </div>
  );
}
