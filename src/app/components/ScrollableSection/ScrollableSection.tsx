"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Default visible card count - matches BusinessRowSkeleton default
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
  const animationFrameRef = useRef<number | null>(null);

  // ─── Scale / opacity effect ───────────────────────────────────────────────
  // Tags the topmost .snap-start children inside the container so the rAF
  // loop can target them without touching nested snap children (e.g. inner
  // carousels). Only runs on mobile-peek rows.
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
      const isTopLevel = !ancestorSnapTarget || !container.contains(ancestorSnapTarget);
      if (isTopLevel) {
        target.setAttribute("data-mobile-snap-target", "true");
      }
    }
  };

  // Interpolates scale (0.92 → 1.0) and opacity (0.70 → 1.0) for each card
  // based on its distance from the container center. Driven by rAF so there
  // is zero CSS transition lag and it feels physically tied to the scroll.
  const updateCardScaleOpacity = () => {
    const container = scrollRef.current;

    // Off-mobile or non-peek rows: clear any previously applied styles.
    if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) {
      if (container) {
        container
          .querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
          .forEach((el) => {
            el.style.transform = "";
            el.style.opacity = "";
          });
      }
      return;
    }

    const snapTargets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
    );
    if (snapTargets.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const maxDistance = container.clientWidth * 0.55;

    for (const el of snapTargets) {
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      const progress = Math.max(0, 1 - distance / maxDistance);

      if (reducedMotion) {
        el.style.transform = "";
        el.style.opacity = progress > 0.5 ? "1" : "0.75";
      } else {
        el.style.transform = `scale(${(0.92 + progress * 0.08).toFixed(3)})`;
        el.style.opacity = (0.7 + progress * 0.3).toFixed(3);
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
  // ─────────────────────────────────────────────────────────────────────────

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScrollLeft = scrollWidth - clientWidth;
    setCanScrollRight(maxScrollLeft > 5);
    setCanScrollLeft(scrollLeft > 5);
    setShowRightArrow(scrollLeft < maxScrollLeft - 10);
    setShowLeftArrow(scrollLeft > 10);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    syncMobileSnapTargets();
    checkScrollPosition();
    updateCardScaleOpacity();

    const handleScroll = () => {
      checkScrollPosition();
      scheduleCardScaleUpdate();
    };

    const handleResize = () => {
      syncMobileSnapTargets();
      checkScrollPosition();
      updateCardScaleOpacity();
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
    });
    resizeObserver.observe(scrollElement);

    // Catch cards added asynchronously (dynamic imports, async data).
    // Observe childList only — NOT attributes, to avoid an infinite loop caused
    // by syncMobileSnapTargets itself setting data-mobile-snap-target.
    const mutationObserver = new MutationObserver(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
      scheduleCardScaleUpdate();
    });
    mutationObserver.observe(scrollElement, { childList: true, subtree: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [shouldEnableMobilePeek]);

  // Re-measure after children settle so arrow visibility and card styles are accurate.
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
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      container.scrollBy({ left: container.clientWidth * 0.85, behavior: "smooth" });
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12;
      container.scrollLeft += cardWidth + gap;
    }
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      container.scrollBy({ left: -(container.clientWidth * 0.85), behavior: "smooth" });
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12;
      container.scrollLeft -= cardWidth + gap;
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`scrollable-section-inner horizontal-scroll scrollbar-hide flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory ${className}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          overscrollBehaviorY: "auto",
          touchAction: "pan-x pan-y",
        } as React.CSSProperties}
      >
        {children}
        {/* Trailing spacer: closes the right-edge gap on the last card */}
        {shouldEnableMobilePeek && (
          <div
            className={`flex-shrink-0 ${mobileTrailingSpacerClassName} sm:hidden`}
            aria-hidden="true"
          />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 639px) {
          /* Industry-standard mobile scroll pattern: mandatory snap on the container
             so the row always rests on a card, but normal stop on cards so a fling
             can carry past multiple cards without braking at every boundary.
             Overrides Tailwind's snap-always (scroll-snap-stop: always) that lives
             on every card component — no need to touch those files. */
          .scrollable-section-inner :global(.snap-start) {
            scroll-snap-stop: normal !important;
          }

          /* Promote cards to their own compositor layer so the rAF-driven
             transform/opacity updates are GPU-composited without triggering
             layout or paint. */
          .scrollable-section-inner :global([data-mobile-snap-target="true"]) {
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
