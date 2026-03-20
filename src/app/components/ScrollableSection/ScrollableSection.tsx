"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
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
  loop?: boolean;
}

export default function ScrollableSection({
  children,
  className = "",
  showArrows = true,
  arrowColor = "text-charcoal/60",
  enableMobilePeek = false,
  hideArrowsOnDesktop = false,
  mobileTrailingSpacerClassName = "w-4",
  loop = false,
}: ScrollableSectionProps) {
  const pathname = usePathname();
  const isHomeRoute = pathname === "/" || pathname.startsWith("/home");
  const shouldEnableMobilePeek = enableMobilePeek || isHomeRoute;
  const isLoopMode = loop && shouldEnableMobilePeek;
  const arrowVisibilityClass = [
    shouldEnableMobilePeek ? "hidden sm:flex" : "flex",
    hideArrowsOnDesktop ? "lg:hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const scrollRef = useRef<HTMLDivElement>(null);
  const leadingSpacerRef = useRef<HTMLDivElement>(null);
  const trailingSpacerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const isTeleportingRef = useRef(false);
  const normalizeTimerRef = useRef<number | null>(null);

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

  // Computes and imperatively sets the leading and trailing spacer widths so
  // the first and last cards can physically scroll to the container's center.
  // With snap-center, a card whose center aligns with the container center gets
  // progress=1.0 in the scale/opacity loop — this makes that true for ALL cards
  // including the first and last.
  //
  // Formula: sideSpace = (containerWidth - cardWidth) / 2 - gap
  // The gap accounts for the flex gap between the spacer and its adjacent card.
  const computeScrollGeometry = () => {
    const container = scrollRef.current;
    const leading = leadingSpacerRef.current;
    const trailing = trailingSpacerRef.current;

    // In loop mode spacers are unused; positioning is done imperatively.
    if (isLoopMode) {
      if (leading) leading.style.width = "0px";
      if (trailing) trailing.style.width = "0px";
      return;
    }

    if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) {
      if (leading) leading.style.width = "0px";
      if (trailing) trailing.style.width = "0px";
      return;
    }

    const firstTarget = container.querySelector<HTMLElement>('[data-mobile-snap-target="true"]');
    if (!firstTarget) return;

    const gap = 8; // gap-2 = 8px on mobile
    const sideSpace = Math.max(
      0,
      Math.round((container.clientWidth - firstTarget.offsetWidth) / 2) - gap
    );

    if (leading) leading.style.width = `${sideSpace}px`;
    if (trailing) trailing.style.width = `${sideSpace}px`;
  };

  const positionAtFirstRealSnapTarget = () => {
    if (!isLoopMode) return;
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 640) return;
    const realSegment = container.querySelector<HTMLElement>('[data-loop-real]');
    if (!realSegment) return;
    const firstTarget = realSegment.querySelector<HTMLElement>('.snap-start');
    if (!firstTarget) return;
    const cRect = container.getBoundingClientRect();
    const tRect = firstTarget.getBoundingClientRect();
    const targetCenter = tRect.left - cRect.left + container.scrollLeft + tRect.width / 2;
    container.scrollLeft = targetCenter - container.clientWidth / 2;
  };

  const normalizeLoopPosition = () => {
    if (!isLoopMode || isTeleportingRef.current) return;
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 640) return;
    const preEl = container.querySelector<HTMLElement>('[data-loop-pre]');
    const realEl = container.querySelector<HTMLElement>('[data-loop-real]');
    if (!preEl || !realEl) return;
    // Need ≥2 real snap targets to make looping meaningful.
    if (realEl.querySelectorAll('.snap-start').length < 2) return;
    const cRect = container.getBoundingClientRect();
    const sl = container.scrollLeft;
    const preLeft = preEl.getBoundingClientRect().left - cRect.left + sl;
    const realRect = realEl.getBoundingClientRect();
    const realLeft = realRect.left - cRect.left + sl;
    const realWidth = realRect.width;
    const shift = realLeft - preLeft; // = preWidth + wrapper gap
    const center = sl + container.clientWidth / 2;
    if (center < realLeft) {
      // In pre-clone → jump forward into real zone
      isTeleportingRef.current = true;
      container.scrollLeft = sl + shift;
      requestAnimationFrame(() => {
        isTeleportingRef.current = false;
        checkScrollPosition();
        updateCardScaleOpacity();
      });
    } else if (center > realLeft + realWidth) {
      // In post-clone → jump back into real zone
      isTeleportingRef.current = true;
      container.scrollLeft = sl - shift;
      requestAnimationFrame(() => {
        isTeleportingRef.current = false;
        checkScrollPosition();
        updateCardScaleOpacity();
      });
    }
  };

  // Interpolates scale (0.92 → 1.0) and opacity (0.70 → 1.0) for each card
  // based on its distance from the container center. Driven by rAF so there
  // is zero CSS transition lag and it feels physically tied to the scroll.
  // With snap-center + correct spacers, a snapped card's center is exactly at
  // containerCenter, so progress=1.0 at rest for every card including first/last.
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
    // Use getBoundingClientRect for both container and cards so the positions
    // are always relative to the actual rendered layout — offsetLeft is
    // relative to offsetParent which breaks when any ancestor (e.g. a Framer
    // Motion wrapper) has position: relative between the card and this container.
    const containerRect = container.getBoundingClientRect();
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const maxDistance = container.clientWidth * 0.55;

    for (const el of snapTargets) {
      const elRect = el.getBoundingClientRect();
      const cardLeft = elRect.left - containerRect.left + container.scrollLeft;
      const cardCenter = cardLeft + elRect.width / 2;
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

  // Synchronously position the loop scroll before first paint to prevent
  // a flash of the pre-clone segment (which starts at scrollLeft = 0).
  useLayoutEffect(() => {
    if (!isLoopMode) return;
    if (typeof window === 'undefined' || window.innerWidth >= 640) return;
    syncMobileSnapTargets();
    positionAtFirstRealSnapTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    syncMobileSnapTargets();
    computeScrollGeometry();
    checkScrollPosition();
    updateCardScaleOpacity();

    if (isLoopMode && window.innerWidth < 640) {
      positionAtFirstRealSnapTarget();
    }

    const hasScrollEnd = 'onscrollend' in scrollElement;

    const handleScroll = () => {
      checkScrollPosition();
      scheduleCardScaleUpdate();
      // Debounce-based normalise fallback for browsers without scrollend.
      if (isLoopMode && !hasScrollEnd && !isTeleportingRef.current) {
        if (normalizeTimerRef.current !== null) clearTimeout(normalizeTimerRef.current);
        normalizeTimerRef.current = window.setTimeout(normalizeLoopPosition, 80);
      }
    };

    const handleResize = () => {
      syncMobileSnapTargets();
      computeScrollGeometry();
      checkScrollPosition();
      updateCardScaleOpacity();
      if (isLoopMode && window.innerWidth < 640) {
        positionAtFirstRealSnapTarget();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    if (isLoopMode && hasScrollEnd) {
      scrollElement.addEventListener('scrollend', normalizeLoopPosition);
    }

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      syncMobileSnapTargets();
      computeScrollGeometry();
      checkScrollPosition();
    });
    resizeObserver.observe(scrollElement);

    // Catch cards added asynchronously (dynamic imports, async data).
    // Observe childList only — NOT attributes, to avoid an infinite loop caused
    // by syncMobileSnapTargets itself setting data-mobile-snap-target.
    const mutationObserver = new MutationObserver(() => {
      syncMobileSnapTargets();
      computeScrollGeometry();
      checkScrollPosition();
      scheduleCardScaleUpdate();
    });
    mutationObserver.observe(scrollElement, { childList: true, subtree: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (isLoopMode && hasScrollEnd) {
        scrollElement.removeEventListener('scrollend', normalizeLoopPosition);
      }
      if (normalizeTimerRef.current !== null) clearTimeout(normalizeTimerRef.current);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [shouldEnableMobilePeek, isLoopMode]);

  // Re-measure after children settle so spacers, arrows, and card styles are accurate.
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      syncMobileSnapTargets();
      computeScrollGeometry();
      checkScrollPosition();
      updateCardScaleOpacity();
    });
    const timeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      computeScrollGeometry();
      checkScrollPosition();
      updateCardScaleOpacity();
    }, 120);
    const lateTimeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      computeScrollGeometry();
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
        {isLoopMode ? (
          /* Clone sandwich: [pre-clone][real][post-clone].
             Pre/post are hidden on sm+ so desktop sees only real content.
             gap-1 on the wrapper matches the mobile card gap for seamless looping. */
          <div className="flex-shrink-0 flex gap-1">
            <div data-loop-pre="" aria-hidden="true" className="flex-shrink-0 sm:hidden">
              {children}
            </div>
            <div data-loop-real="" className="flex-shrink-0">
              {children}
            </div>
            <div data-loop-post="" aria-hidden="true" className="flex-shrink-0 sm:hidden">
              {children}
            </div>
          </div>
        ) : (
          <>
            {/* Leading spacer: allows the first card to scroll to the container center.
                Width is computed imperatively in computeScrollGeometry(). */}
            {shouldEnableMobilePeek && (
              <div ref={leadingSpacerRef} className="flex-shrink-0 sm:hidden" aria-hidden="true" />
            )}

            {children}

            {/* Trailing spacer: allows the last card to scroll to the container center.
                Width is computed imperatively in computeScrollGeometry(). */}
            {shouldEnableMobilePeek && (
              <div
                ref={trailingSpacerRef}
                className={`flex-shrink-0 ${mobileTrailingSpacerClassName} sm:hidden`}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 639px) {
          /* snap-center: cards snap so their center aligns with the container center.
             This makes the scale/opacity effect accurate — a snapped card's center
             is at containerCenter, giving progress=1.0 (full scale and opacity).
             snap-stop normal: lets a fling carry past multiple cards without braking
             at each boundary. Both override the Tailwind snap-start/snap-always on
             card elements — no need to touch those files. */
          .scrollable-section-inner :global(.snap-start) {
            scroll-snap-align: center !important;
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
