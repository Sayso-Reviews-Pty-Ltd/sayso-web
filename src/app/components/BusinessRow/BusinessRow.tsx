// src/components/BusinessRow/BusinessRow.tsx
"use client";

import { useEffect, useMemo } from "react";
import BusinessCard, { Business } from "../BusinessCard/BusinessCard";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import LocationPromptBanner from "../Location/LocationPromptBanner";
import { HomeSectionRow } from "../HomeSectionRow/HomeSectionRow";
import {
  HOME_SECTION_CARD_BASE_CLASS,
  HOME_SECTION_RAIL_CLASS,
} from "../HomeSectionRow/homeSectionLayout";
import { coerceCoordinate } from "../../hooks/useBusinessDistanceLocation";
import { useRouter } from "next/navigation";
import CardRail from "../CardRail/CardRail";

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
  const hasCoordinateBusinesses = useMemo(
    () =>
      businesses.some((business) => {
        const normalizedLat = coerceCoordinate(
          (business as Business & { latitude?: unknown }).lat ??
            (business as Business & { latitude?: unknown }).latitude
        );
        const normalizedLng = coerceCoordinate(
          (business as Business & { longitude?: unknown }).lng ??
            (business as Business & { longitude?: unknown }).longitude
        );
        return normalizedLat !== null && normalizedLng !== null;
      }),
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
          (maybePromise as unknown as Promise<unknown>).catch(() => {});
        }
      } catch {}
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
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [href, router]);

  if (!businesses || businesses.length === 0) return null;

  // Always use the home-section peek shell so one-card rails match Events & Specials gutters/width.
  const cardClass = `${HOME_SECTION_CARD_BASE_CLASS} business-card-full-width`;

  return (
    <>
      <LocationPromptBanner hasCoordinateBusinesses={hasCoordinateBusinesses} />
      <HomeSectionRow title={title} cta={cta} href={href} disableAnimations={disableAnimations}>
        <ScrollableSection
          enableMobilePeek
          hideArrowsOnDesktop={hideCarouselArrowsOnDesktop}
          className={HOME_SECTION_RAIL_CLASS}
        >
          <CardRail
            items={businesses}
            getKey={(b) => b.id}
            renderCard={(b, i) => <BusinessCard business={b} index={i} />}
            cardClassName={cardClass}
            disableAnimations={disableAnimations}
            mobileFullBleedClassName="business-card-full-width"
          />
        </ScrollableSection>
      </HomeSectionRow>
    </>
  );
}
