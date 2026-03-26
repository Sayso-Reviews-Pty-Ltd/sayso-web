"use client";

import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

// Default visible card count — kept for external references
export const DEFAULT_VISIBLE_CARD_COUNT = 4;

interface ScrollableSectionProps {
  /** Preferred API — each item becomes its own SwiperSlide. */
  items?: React.ReactNode[];
  /** Compat path — children are flattened via React.Children.toArray into slides. */
  children?: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  enableMobilePeek?: boolean;
  hideArrowsOnDesktop?: boolean;
  /** When true, suppresses the opacity fade applied to off-centre peeking slides. */
  disablePeekFade?: boolean;
}

export default function ScrollableSection({
  items,
  children,
  className = "",
  showArrows = true,
  enableMobilePeek = false,
  hideArrowsOnDesktop = false,
  disablePeekFade = false,
}: ScrollableSectionProps) {
  const pathname = usePathname();
  const isHomeRoute = pathname === "/" || pathname.startsWith("/home");
  const shouldEnableMobilePeek = enableMobilePeek || isHomeRoute;
  const spaceBetween = 10;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Resolve slides from items prop (preferred) or flatten children (compat)
  const slides: React.ReactNode[] = items
    ? items
    : React.Children.toArray(children);

  const handleProgress = (swiper: SwiperType) => {
    if (typeof window === "undefined" || window.innerWidth >= 640) {
      // Clear any mobile styles on desktop
      swiper.slides.forEach((slide) => {
        (slide as HTMLElement).style.transform = "";
        (slide as HTMLElement).style.opacity = "";
      });
      return;
    }
    if (!shouldEnableMobilePeek) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const containerWidth = swiper.width;
    const containerCenter = swiper.translate * -1 + containerWidth / 2;
    const maxDistance = containerWidth * 0.55;

    swiper.slides.forEach((slide, i) => {
      const el = slide as HTMLElement;
      el.style.transform = "";

      if (disablePeekFade) {
        el.style.opacity = "";
        return;
      }

      const slideLeft = (swiper as any).slidesGrid?.[i] ?? 0;
      const slideWidth = el.offsetWidth;
      const slideCenter = slideLeft + slideWidth / 2;
      const distance = Math.abs(slideCenter - containerCenter);
      const progress = Math.max(0, 1 - distance / maxDistance);

      el.style.opacity = reducedMotion
        ? (progress > 0.5 ? "1" : "0.75")
        : (0.7 + progress * 0.3).toFixed(3);
    });
  };

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
  // On mobile peek routes arrows are hidden on mobile (swipe handles it)
  const mobileHide = shouldEnableMobilePeek ? "hidden sm:flex" : "flex";

  return (
    <div className={`relative ${className}`}>
      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        freeMode={false}
        grabCursor
        navigation={
          showArrows
            ? { prevEl: prevRef.current, nextEl: nextRef.current }
            : false
        }
        onBeforeInit={(swiper) => {
          if (!showArrows) return;
          // Wire up custom arrow refs before Swiper initialises
          if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        onProgress={handleProgress}
        onSlideChange={handleProgress}
        style={{ overflow: "visible" }}
        className="swiper-scroll-rail"
      >
        {slides.map((slide, i) => (
          <SwiperSlide
            key={i}
            style={{ width: "auto", height: "auto" }}
          >
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>

      {showArrows && (
        <>
          <button
            ref={prevRef}
            className={`${arrowBase} left-2 ${mobileHide} ${desktopHide} swiper-custom-prev`}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            ref={nextRef}
            className={`${arrowBase} right-2 ${mobileHide} ${desktopHide} swiper-custom-next`}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <style jsx>{`
        :global(.swiper-scroll-rail) {
          overflow: visible !important;
          padding-bottom: 8px;
        }
        :global(.swiper-scroll-rail .swiper-wrapper) {
          align-items: stretch;
        }
        :global(.swiper-scroll-rail .swiper-slide) {
          height: auto !important;
        }
        :global(.swiper-button-disabled) {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
