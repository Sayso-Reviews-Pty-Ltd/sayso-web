// src/components/BusinessRow/BusinessRow.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@/app/lib/icons";
import { m } from "framer-motion";
import BusinessCard, { Business } from "../BusinessCard/BusinessCard";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import LocationPromptBanner from "../Location/LocationPromptBanner";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { coerceCoordinate } from "../../hooks/useBusinessDistanceLocation";

// Mobile snap-center geometry: matches EventsSpecials / CommunityHighlights rail geometry.
// - Card fills viewport minus 56px (16px section padding + 40px peek gutter), same as other rows.
// - No left offset: first card starts flush with the scroll container edge, matching events/BOTM.
const MOBILE_PEEK_CARD_WIDTH = 'w-[calc(100vw-80px)]';
// ScrollableSection default trailing spacer (w-4 = 16px) is used; no override needed.

// Animation variants for staggered card appearance (matching badge page)
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function BusinessRow({
  title,
  businesses,
  cta = "View All",
  href = "/home",
  disableAnimations = false,
  hideCarouselArrowsOnDesktop = false,
}: {
  title: string;
  businesses: Business[];
  cta?: string;
  href?: string;
  disableAnimations?: boolean;
  hideCarouselArrowsOnDesktop?: boolean;
}) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const isSingleCard = businesses.length === 1;
  const hasCoordinateBusinesses = useMemo(
    () =>
      businesses.some(
        (business) => {
          const normalizedLat = coerceCoordinate(
            (business as Business & { latitude?: unknown }).lat ??
              (business as Business & { latitude?: unknown }).latitude
          );
          const normalizedLng = coerceCoordinate(
            (business as Business & { longitude?: unknown }).lng ??
              (business as Business & { longitude?: unknown }).longitude
          );
          return normalizedLat !== null && normalizedLng !== null;
        }
      ),
    [businesses]
  );

  useEffect(() => {
    if (!href || !href.startsWith("/")) return;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const prefetch = () => {
      if (typeof router.prefetch !== "function") return;
      try {
        const maybePromise = router.prefetch(href);
        if (typeof (maybePromise as unknown as Promise<unknown>)?.catch === "function") {
          (maybePromise as unknown as Promise<unknown>).catch(() => {
            // ignore failures (e.g., dynamic routes without params yet)
          });
        }
      } catch {
        // ignore synchronous failures
      }
    };

    const schedulePrefetch = () => {
      if (typeof window === "undefined") return;
      const idleCallback = (window as any).requestIdleCallback;
      if (typeof idleCallback === "function") {
        idleId = idleCallback(prefetch, { timeout: 1200 });
      } else {
        timeoutId = window.setTimeout(prefetch, 120);
      }
    };

    schedulePrefetch();

    return () => {
      if (typeof window === "undefined") return;
      if (idleId !== null && typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [href, router]);

  if (!businesses || businesses.length === 0) return null;

  return (
    <section
      className="relative m-0 w-full"
      aria-label={title}
      style={{
        fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      }}
    >
      <LocationPromptBanner hasCoordinateBusinesses={hasCoordinateBusinesses} />
      <div className="mx-auto w-full max-w-[2000px] relative z-10 px-2">
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          {disableAnimations ? (
            <h2
              className="font-urbanist text-2xl sm:text-3xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 px-3 sm:px-4 py-1 hover:bg-card-bg/5 rounded-lg cursor-default"
              style={{ 
                fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                fontWeight: 800,
              }}
            >
              {title}
            </h2>
          ) : (
            <m.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-urbanist text-2xl sm:text-3xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 px-3 sm:px-4 py-1 hover:bg-card-bg/5 rounded-lg cursor-default"
              style={{ 
                fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                fontWeight: 800,
              }}
            >
              {title}
            </m.h2>
          )}

          <button
            onClick={() => router.push(href)}
            className="group inline-flex items-center gap-1 text-body-sm sm:text-caption font-normal text-charcoal transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:text-sage focus:outline-none px-4 py-2 -mx-2 relative motion-reduce:transition-none"
            aria-label={`${cta}: ${title}`}
          >
            <span
              className="relative z-10 transition-[color] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-charcoal group-hover:text-sage motion-reduce:transition-none"
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 400 }}
            >
              {cta.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-[3px] text-charcoal group-hover:text-sage motion-reduce:transition-none" />
          </button>
        </div>

        <ScrollableSection
          enableMobilePeek
          hideArrowsOnDesktop={hideCarouselArrowsOnDesktop}
          className="items-stretch py-2"
        >
          {/* Gap harmonizes with card radius/shadows; list semantics preserved via <li> inside cards */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 639px) {
              .business-card-full-width > li {
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `}} />
          {isDesktop ? (
            disableAnimations ? (
              <div className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch">
                {businesses.map((business, index) => (
                  <div
                    key={business.id}
                    className={`snap-start snap-always flex-shrink-0 ${isSingleCard ? 'w-auto' : MOBILE_PEEK_CARD_WIDTH} sm:w-auto min-w-[clamp(200px,16vw,300px)] list-none flex justify-center h-full business-card-full-width`}
                  >
                    <BusinessCard business={business} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <m.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch"
              >
                {businesses.map((business, index) => (
                  <m.div
                    key={business.id}
                    variants={itemVariants}
                    className={`snap-start snap-always flex-shrink-0 ${isSingleCard ? 'w-auto' : MOBILE_PEEK_CARD_WIDTH} sm:w-auto min-w-[clamp(200px,16vw,300px)] list-none flex justify-center h-full business-card-full-width`}
                  >
                    <BusinessCard business={business} index={index} />
                  </m.div>
                ))}
              </m.div>
            )
          ) : (
            <>
              {businesses.map((business, index) => {
                const isFirst = index === 0 && businesses.length > 1;
                const isLast = index === businesses.length - 1 && businesses.length > 1;
                return (
                  <div
                    key={business.id}
                    data-edge-snap={isFirst ? "first" : isLast ? "last" : undefined}
                    className={`snap-start snap-always flex-shrink-0 ${isSingleCard ? 'w-auto' : MOBILE_PEEK_CARD_WIDTH} sm:w-auto min-w-[clamp(200px,16vw,300px)] list-none flex justify-center h-full business-card-full-width`}
                  >
                    <BusinessCard business={business} index={index} />
                  </div>
                );
              })}
            </>
          )}
        </ScrollableSection>
      </div>
    </section>
  );
}
