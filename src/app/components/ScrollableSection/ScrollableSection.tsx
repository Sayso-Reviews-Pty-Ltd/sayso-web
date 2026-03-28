"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const DEFAULT_VISIBLE_CARD_COUNT = 4;

interface ScrollableSectionProps {
  items?: React.ReactNode[];
  children?: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  enableMobilePeek?: boolean;
  hideArrowsOnDesktop?: boolean;
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 4;
    setCanScrollLeft(el.scrollLeft > threshold);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - threshold);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showArrows) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [showArrows, updateArrows]);

  const scroll = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
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
  const mobileHide = shouldEnableMobilePeek ? "hidden sm:flex" : "flex";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="rail-scroll overflow-x-auto px-2 pb-2"
        style={
          {
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          } as React.CSSProperties
        }
      >
        {items ? (
          <div className="flex gap-3">
            {items.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {showArrows && canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className={`${arrowBase} left-2 ${mobileHide} ${desktopHide}`}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {showArrows && canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className={`${arrowBase} right-2 ${mobileHide} ${desktopHide}`}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <style jsx>{`
        :global(.rail-scroll::-webkit-scrollbar) {
          display: none;
        }
      `}</style>
    </div>
  );
}
