"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

// Default visible card count — kept for external references
export const DEFAULT_VISIBLE_CARD_COUNT = 4;

interface ScrollableSectionProps {
  /** Preferred API — each item is rendered inside the scroll row. */
  items?: React.ReactNode[];
  /** Compat path — children (e.g. CardRail) are passed directly as scroll content. */
  children?: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  enableMobilePeek?: boolean;
  hideArrowsOnDesktop?: boolean;
  /** Retained for API compatibility — opacity fade is no longer applied. */
  disablePeekFade?: boolean;
}

export default function ScrollableSection({
  items,
  children,
  className = "",
  showArrows = true,
  enableMobilePeek = false,
  hideArrowsOnDesktop = false,
}: ScrollableSectionProps) {
  const pathname = usePathname();
  const isHomeRoute = pathname === "/" || pathname.startsWith("/home");
  const shouldEnableMobilePeek = enableMobilePeek || isHomeRoute;

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  // Mark the card whose left edge is closest to the current scroll position.
  // The CSS below uses [data-rail-active] to apply scale on mobile only.
  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const flex = el.firstElementChild as HTMLElement | null;
    if (!flex) return;
    const cards = Array.from(flex.children) as HTMLElement[];
    if (cards.length === 0) return;

    // Snap target = scrollLeft + the left gutter (pl-2 = 8px).
    const snapTarget = el.scrollLeft + 8;
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - snapTarget);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    });
    cards.forEach((card, i) => {
      card.dataset.railActive = i === bestIdx ? "1" : "0";
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActive();
    el.addEventListener("scroll", updateActive, { passive: true });
    return () => el.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const arrowBase = `
    absolute top-1/2 -translate-y-1/2 z-40
    w-14 h-14 sm:w-12 sm:h-12
    bg-navbar-bg rounded-full
    flex items-center justify-center
    transition-all duration-300 ease-out active:scale-95
    text-white touch-manipulation
    shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(139,176,138,0.3)]
    sm:shadow-lg
    hover:bg-card-bg hover:shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(139,176,138,0.4)]
    border border-sage/20
  `;

  const desktopHide = hideArrowsOnDesktop ? "lg:hidden" : "";
  // On mobile peek routes, hide arrows — swiping handles navigation
  const mobileHide = shouldEnableMobilePeek ? "hidden sm:flex" : "flex";

  return (
    // -mx-2 sm:mx-0: cancel the parent section's 8px horizontal inset on mobile so
    // the rail extends to the viewport edge, letting 90vw cards leave ~10vw of peek.
    <div className={`relative -mx-2 sm:mx-0 ${className}`}>
      <div
        ref={scrollRef}
        // pl-2: 8px left gutter aligns the first card with the page content.
        // pr-0 on mobile: no right padding so the next card peeks through.
        // sm:px-2: restore symmetric padding on tablet/desktop.
        className="rail-scroll overflow-x-auto pl-2 pr-0 sm:px-2 pb-2"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: "0.5rem",
        } as React.CSSProperties}
      >
        {items ? (
          <div className="flex gap-3">
            {items.map((item, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {showArrows && (
        <>
          <button
            onClick={() => scroll(-1)}
            className={`${arrowBase} left-2 ${mobileHide} ${desktopHide}`}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className={`${arrowBase} right-2 ${mobileHide} ${desktopHide}`}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <style jsx>{`
        :global(.rail-scroll::-webkit-scrollbar) {
          display: none;
        }

        /* Mobile-only visual hierarchy: focused card is full size, others recede. */
        @media (max-width: 639px) {
          :global(.rail-scroll > * > [data-rail-active="1"]) {
            transform: scale(1);
            opacity: 1;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
          :global(.rail-scroll > * > [data-rail-active="0"]) {
            transform: scale(0.95);
            opacity: 0.82;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
        }
      `}</style>
    </div>
  );
}
