"use client";

import React, { useRef, useCallback } from "react";
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
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="rail-scroll overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x proximity",
        } as React.CSSProperties}
      >
        {items ? (
          <div className="flex gap-2.5 sm:gap-3">
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
      `}</style>
    </div>
  );
}
