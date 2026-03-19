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
}

export default function ScrollableSection({
  children,
  className = "",
  showArrows = true,
  arrowColor = "text-charcoal/60",
  enableMobilePeek = false,
  hideArrowsOnDesktop = false,
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
  const cardEdgeObserverRef = useRef<IntersectionObserver | null>(null);

  // Rebuilds the IntersectionObserver that drives the edge fade+scale animation.
  // Must be called AFTER syncMobileSnapTargets so data-mobile-snap-target attrs are current.
  const syncCardEdgeObserver = () => {
    const container = scrollRef.current;
    if (!container) return;

    cardEdgeObserverRef.current?.disconnect();

    // Only active on mobile peek rows — desktop cards are always fully visible.
    if (!shouldEnableMobilePeek || window.innerWidth >= 640) {
      container.querySelectorAll<HTMLElement>('[data-card-edge]').forEach((el) => {
        el.removeAttribute('data-card-edge');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.intersectionRatio >= 0.85) {
            el.removeAttribute('data-card-edge');
          } else {
            el.setAttribute('data-card-edge', 'true');
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.5, 0.85, 1],
      }
    );

    container
      .querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
      .forEach((el) => observer.observe(el));

    cardEdgeObserverRef.current = observer;
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

    syncCardEdgeObserver();
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

    const handleScroll = () => checkScrollPosition();
    const handleResize = () => {
      syncMobileSnapTargets();
      checkScrollPosition();
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
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
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      cardEdgeObserverRef.current?.disconnect();
    };
  }, []);

  // Rows often populate asynchronously (fetch + dynamic imports).
  // Re-measure after children settle so mobile hint visibility is accurate.
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
    });
    const timeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
    }, 120);
    const lateTimeoutId = window.setTimeout(() => {
      syncMobileSnapTargets();
      checkScrollPosition();
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
      // Scroll to the next snap target's exact offsetLeft so mandatory snap doesn't jank back.
      const snapTargets = Array.from(
        container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
      );
      const currentScroll = container.scrollLeft;
      const next = snapTargets.find((el) => el.offsetLeft > currentScroll + 5);
      container.scrollTo({ left: next ? next.offsetLeft : container.scrollLeft + container.clientWidth, behavior: 'smooth' });
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12; // gap-3 on larger screens
      container.scrollLeft += cardWidth + gap;
    }
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (isMobile) {
      // Scroll to the previous snap target's exact offsetLeft.
      const snapTargets = Array.from(
        container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
      );
      const currentScroll = container.scrollLeft;
      const prev = [...snapTargets].reverse().find((el) => el.offsetLeft < currentScroll - 5);
      container.scrollTo({ left: prev ? prev.offsetLeft : 0, behavior: 'smooth' });
    } else {
      const cardWidth = container.clientWidth * 0.25;
      const gap = 12; // gap-3 on larger screens
      container.scrollLeft -= cardWidth + gap;
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`horizontal-scroll scrollbar-hide scrollable-mobile-center flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:snap-mandatory ${className}`}
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
          <div className="flex-shrink-0 w-4 sm:hidden" aria-hidden="true" />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 639px) {
          .scrollable-mobile-center :global(.snap-start[data-mobile-snap-target="true"]) {
            scroll-snap-align: start !important;
            scroll-snap-stop: always !important;
          }

          .scrollable-mobile-center :global(.snap-start:not([data-mobile-snap-target="true"])) {
            scroll-snap-align: none !important;
            scroll-snap-stop: normal !important;
          }

          /* RTL: flip snap alignment so cards anchor to the inline-end edge */
          [dir="rtl"] .scrollable-mobile-center :global(.snap-start[data-mobile-snap-target="true"]) {
            scroll-snap-align: end !important;
          }

          /* Edge fade+scale: cards partially off-screen dim and shrink slightly */
          .scrollable-mobile-center :global([data-mobile-snap-target="true"]) {
            transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity  0.22s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform, opacity;
          }
          .scrollable-mobile-center :global([data-mobile-snap-target="true"][data-card-edge="true"]) {
            transform: scale(0.93);
            opacity: 0.6;
          }

          @media (prefers-reduced-motion: reduce) {
            .scrollable-mobile-center :global([data-mobile-snap-target="true"]) {
              transition: none;
            }
            .scrollable-mobile-center :global([data-mobile-snap-target="true"][data-card-edge="true"]) {
              transform: none;
              opacity: 0.75;
            }
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
