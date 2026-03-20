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
  const hasInitialPositionRef = useRef(false);

  const realRef = useRef<HTMLDivElement>(null);
  const preCloneRef = useRef<HTMLDivElement>(null);
  const postCloneRef = useRef<HTMLDivElement>(null);
  const isTeleportingRef = useRef(false);
  const normalizeTimerRef = useRef<number | null>(null);
  const hasLoopInitializedRef = useRef(false);

  const applyScrollGeometry = () => {
    if (isLoopMode) {
      // In loop mode spacers are not used; positioning is done imperatively.
      const leading = leadingSpacerRef.current;
      const trailing = trailingSpacerRef.current;
      if (leading) leading.style.width = "0px";
      if (trailing) trailing.style.width = "0px";
      return;
    }
    computeScrollGeometry({
      container: scrollRef.current,
      leading: leadingSpacerRef.current,
      trailing: trailingSpacerRef.current,
      shouldEnableMobilePeek,
    });
  };

  const updateClones = () => {
    const real = realRef.current;
    const pre = preCloneRef.current;
    const post = postCloneRef.current;
    if (!real || !pre || !post) return;

    // Clear previous clone content
    while (pre.firstChild) pre.removeChild(pre.firstChild);
    while (post.firstChild) post.removeChild(post.firstChild);

    // Clone real DOM (not React tree) into pre and post
    Array.from(real.children).forEach((child) => {
      const preClone = child.cloneNode(true) as HTMLElement;
      const postClone = child.cloneNode(true) as HTMLElement;
      // Eager-load images so clones don't flash when scrolled into view
      preClone.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'eager'));
      postClone.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'eager'));
      pre.appendChild(preClone);
      post.appendChild(postClone);
    });
  };

  const positionAtFirstRealSnapTarget = () => {
    if (hasLoopInitializedRef.current) return;
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 640) return;
    const realSegment = realRef.current;
    if (!realSegment) return;
    const firstTarget = realSegment.querySelector<HTMLElement>('.snap-start');
    if (!firstTarget) return;
    hasLoopInitializedRef.current = true;
    const cRect = container.getBoundingClientRect();
    const tRect = firstTarget.getBoundingClientRect();
    const targetCenter = tRect.left - cRect.left + container.scrollLeft + tRect.width / 2;
    container.scrollLeft = targetCenter - container.clientWidth / 2;
  };

  const normalizeLoopPosition = () => {
    if (!isLoopMode || isTeleportingRef.current) return;
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 640) return;
    const preEl = preCloneRef.current;
    const realEl = realRef.current;
    if (!preEl || !realEl) return;
    if (realEl.querySelectorAll('.snap-start').length < 2) return;

    const cRect = container.getBoundingClientRect();
    const sl = container.scrollLeft;
    const preLeft = preEl.getBoundingClientRect().left - cRect.left + sl;
    const realRect = realEl.getBoundingClientRect();
    const realLeft = realRect.left - cRect.left + sl;
    const realWidth = realRect.width;
    const shift = realLeft - preLeft;
    const center = sl + container.clientWidth / 2;

    if (center < realLeft) {
      isTeleportingRef.current = true;
      container.scrollLeft = sl + shift;
      requestAnimationFrame(() => {
        isTeleportingRef.current = false;
        checkScrollPosition();
        applyCardScaleOpacity();
      });
    } else if (center > realLeft + realWidth) {
      isTeleportingRef.current = true;
      container.scrollLeft = sl - shift;
      requestAnimationFrame(() => {
        isTeleportingRef.current = false;
        checkScrollPosition();
        applyCardScaleOpacity();
      });
    }
  };

  // Interpolates scale (0.92 → 1.0) and opacity (0.70 → 1.0) for each card
  // based on its distance from the container center. Driven by rAF so there
  // is zero CSS transition lag and it feels physically tied to the scroll.
  // With snap-center + correct spacers, a snapped card's center is exactly at
  // containerCenter, so progress=1.0 at rest for every card including first/last.
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
  // ─────────────────────────────────────────────────────────────────────────

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

    if (isLoopMode) {
      // Set inert on clone containers before first paint
      if (preCloneRef.current) preCloneRef.current.setAttribute('inert', '');
      if (postCloneRef.current) postCloneRef.current.setAttribute('inert', '');
      syncMobileSnapTargets(container);
      applyScrollGeometry();
      updateClones();
      syncMobileSnapTargets(container); // Re-sync after clones are populated
      positionAtFirstRealSnapTarget();
    } else if (shouldEnableMobilePeek) {
      // Non-loop: start at second card for both-sides peek
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

    if (isLoopMode && window.innerWidth < 640) {
      updateClones();
      syncMobileSnapTargets(scrollElement);
      positionAtFirstRealSnapTarget();
    }

    const hasScrollEnd = 'onscrollend' in scrollElement;

    const handleScroll = () => {
      checkScrollPosition();
      scheduleCardScaleUpdate();
      if (isLoopMode && !hasScrollEnd && !isTeleportingRef.current) {
        if (normalizeTimerRef.current !== null) clearTimeout(normalizeTimerRef.current);
        normalizeTimerRef.current = window.setTimeout(normalizeLoopPosition, 80);
      }
    };

    const handleResize = () => {
      syncMobileSnapTargets(scrollElement);
      applyScrollGeometry();
      checkScrollPosition();
      applyCardScaleOpacity();
      if (isLoopMode) {
        if (window.innerWidth < 640) {
          // Mobile: re-clone and re-position
          hasLoopInitializedRef.current = false;
          updateClones();
          syncMobileSnapTargets(scrollElement);
          positionAtFirstRealSnapTarget();
        } else {
          // Desktop: reset scroll to start (clones are hidden via sm:hidden)
          scrollElement.scrollLeft = 0;
        }
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    if (isLoopMode && hasScrollEnd) {
      scrollElement.addEventListener('scrollend', normalizeLoopPosition);
    }

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
      if (isLoopMode) {
        // Re-clone when real content changes (e.g. async data arriving)
        const newCount = realRef.current?.querySelectorAll('.snap-start').length ?? 0;
        if (newCount > 0) {
          updateClones();
          syncMobileSnapTargets(scrollElement);
          positionAtFirstRealSnapTarget();
        }
      } else {
        // If cards weren't ready during the initial useLayoutEffect (async data),
        // position at second card now that they've arrived.
        positionAtSecondCard({
          container: scrollElement,
          shouldEnableMobilePeek,
          hasInitialPositionRef,
        });
      }
    });
    const moTarget = isLoopMode && realRef.current ? realRef.current : scrollElement;
    mutationObserver.observe(moTarget, { childList: true, subtree: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (isLoopMode && hasScrollEnd) {
        scrollElement.removeEventListener('scrollend', normalizeLoopPosition);
      }
      if (normalizeTimerRef.current !== null) clearTimeout(normalizeTimerRef.current);
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

  // In loop mode, re-clone when children change (e.g. data reload).
  // Only re-clone — do NOT reset scroll position (would disrupt user).
  useEffect(() => {
    if (!isLoopMode) return;
    const container = scrollRef.current;
    if (!container || typeof window === 'undefined' || window.innerWidth >= 640) return;
    updateClones();
    syncMobileSnapTargets(container);
  }, [children, isLoopMode]);

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
        {isLoopMode ? (
          /* DOM-clone sandwich: [pre-clone][real][post-clone].
             Pre/post are hidden on sm+ (sm:hidden) so desktop is unaffected.
             Clones are pure DOM (cloneNode) — no React instances, no hooks,
             no Framer Motion state. inert attr set imperatively on mount. */
          <div className="flex-shrink-0 flex gap-1">
            <div
              ref={preCloneRef}
              data-loop-pre=""
              aria-hidden="true"
              className="flex-shrink-0 sm:hidden"
            />
            <div
              ref={realRef}
              data-loop-real=""
              className="flex-shrink-0"
            >
              {children}
            </div>
            <div
              ref={postCloneRef}
              data-loop-post=""
              aria-hidden="true"
              className="flex-shrink-0 sm:hidden"
            />
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
