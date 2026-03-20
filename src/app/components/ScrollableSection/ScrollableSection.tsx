"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollArrowButton from "./ScrollArrowButton";
import {
  computeScrollGeometry,
  getScrollPositionState,
  positionAtSecondCard,
  scrollContainer,
  syncMobileSnapTargets,
  updateCardScaleOpacity,
} from "./scrollableSection.utils";

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
  const leadingSpacerRef = useRef<HTMLDivElement>(null);
  const trailingSpacerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const hasInitialPositionRef = useRef(false);

  const applyScrollGeometry = () => {
    computeScrollGeometry({
      container: scrollRef.current,
      leading: leadingSpacerRef.current,
      trailing: trailingSpacerRef.current,
      shouldEnableMobilePeek,
    });
  };

  // Interpolates scale (0.92 → 1.0) and opacity (0.70 → 1.0) for each card
  // based on its distance from the container center. Driven by rAF so there
  // is zero CSS transition lag and it feels physically tied to the scroll.
  const applyCardScaleOpacity = () => {
    updateCardScaleOpacity({
      container: scrollRef.current,
      shouldEnableMobilePeek,
    });
  };

  const scheduleCardScaleUpdate = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      applyCardScaleOpacity();
    });
  };

  const checkScrollPosition = () => {
    const scrollState = getScrollPositionState(scrollRef.current);
    if (!scrollState) return;
    setCanScrollRight(scrollState.canScrollRight);
    setCanScrollLeft(scrollState.canScrollLeft);
    setShowRightArrow(scrollState.showRightArrow);
    setShowLeftArrow(scrollState.showLeftArrow);
  };

  // Run before first paint so the user never sees a scroll jump.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 640) return;

    if (shouldEnableMobilePeek) {
      syncMobileSnapTargets(container);
      computeScrollGeometry({
        container,
        leading: leadingSpacerRef.current,
        trailing: trailingSpacerRef.current,
        shouldEnableMobilePeek,
      });
      positionAtSecondCard({
        container,
        shouldEnableMobilePeek,
        hasInitialPositionRef,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    syncMobileSnapTargets(scrollElement);
    applyScrollGeometry();
    checkScrollPosition();
    applyCardScaleOpacity();

    const handleScroll = () => {
      checkScrollPosition();
      scheduleCardScaleUpdate();
    };

    const handleResize = () => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      applyCardScaleOpacity();
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
    });
    resizeObserver.observe(scrollElement);

    // Catch cards added asynchronously (dynamic imports, async data).
    // Observe childList only — NOT attributes, to avoid an infinite loop caused
    // by syncMobileSnapTargets itself setting data-mobile-snap-target.
    const mutationObserver = new MutationObserver(() => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      scheduleCardScaleUpdate();
      // If cards weren't ready during the initial useLayoutEffect (async data),
      // position at second card now that they've arrived.
      positionAtSecondCard({
        container: scrollElement,
        shouldEnableMobilePeek,
        hasInitialPositionRef,
      });
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

  // Re-measure after children settle so spacers, arrows, and card styles are accurate.
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      applyCardScaleOpacity();
    });
    const timeoutId = window.setTimeout(() => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      applyCardScaleOpacity();
    }, 120);
    const lateTimeoutId = window.setTimeout(() => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      applyCardScaleOpacity();
    }, 360);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(lateTimeoutId);
    };
  }, [children, className, shouldEnableMobilePeek]);

  const scrollRight = () => {
    scrollContainer(scrollRef.current, "right");
  };

  const scrollLeft = () => {
    scrollContainer(scrollRef.current, "left");
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
      </div>

      <style jsx>{`
        @media (max-width: 639px) {
          /* snap-center: cards snap so their center aligns with the container center.
             This makes the scale/opacity effect accurate — a snapped card's center
             is at containerCenter, giving progress=1.0 at rest for every card including first/last.
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
            <ScrollArrowButton
              direction="left"
              onClick={scrollLeft}
              arrowVisibilityClass={arrowVisibilityClass}
            />
          )}
          {canScrollRight && showRightArrow && (
            <ScrollArrowButton
              direction="right"
              onClick={scrollRight}
              arrowVisibilityClass={arrowVisibilityClass}
            />
          )}
        </>
      )}
    </div>
  );
}
