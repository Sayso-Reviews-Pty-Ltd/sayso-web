// src/components/BusinessRow/BusinessRow.tsx
"use client";

import { useEffect, useMemo } from "react";
import { m } from "framer-motion";
import BusinessCard, { Business } from "../BusinessCard/BusinessCard";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import LocationPromptBanner from "../Location/LocationPromptBanner";
import { HomeSectionRow } from "../HomeSectionRow/HomeSectionRow";
import {
  HOME_SECTION_CARD_BASE_CLASS,
  HOME_SECTION_RAIL_CLASS,
  HOME_SECTION_RAIL_GAP_CLASS,
} from "../HomeSectionRow/homeSectionLayout";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { coerceCoordinate } from "../../hooks/useBusinessDistanceLocation";
import { useRouter } from "next/navigation";

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

  const cardClass = isSingleCard
    ? "snap-start snap-always flex-shrink-0 w-auto sm:w-auto list-none flex justify-center h-full business-card-full-width"
    : `${HOME_SECTION_CARD_BASE_CLASS} business-card-full-width`;

  const desktopCards = disableAnimations ? (
    <div className={`flex ${HOME_SECTION_RAIL_GAP_CLASS} items-stretch`}>
      {businesses.map((business, index) => (
        <div key={business.id} className={cardClass}>
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
      className={`flex ${HOME_SECTION_RAIL_GAP_CLASS} items-stretch`}
    >
      {businesses.map((business, index) => (
        <m.div key={business.id} variants={itemVariants} className={cardClass}>
          <BusinessCard business={business} index={index} />
        </m.div>
      ))}
    </m.div>
  );

  const mobileCards = businesses.map((business, index) => {
    const isFirst = index === 0 && businesses.length > 1;
    const isLast = index === businesses.length - 1 && businesses.length > 1;
    return (
      <div
        key={business.id}
        data-edge-snap={isFirst ? "first" : isLast ? "last" : undefined}
        className={cardClass}
      >
        <BusinessCard business={business} index={index} />
      </div>
    );
  });

  return (
    <>
      <LocationPromptBanner hasCoordinateBusinesses={hasCoordinateBusinesses} />
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 639px) {
          .business-card-full-width > li {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
      <HomeSectionRow
        title={title}
        cta={cta}
        href={href}
        disableAnimations={disableAnimations}
      >
        <ScrollableSection
          enableMobilePeek
          hideArrowsOnDesktop={hideCarouselArrowsOnDesktop}
          className={HOME_SECTION_RAIL_CLASS}
        >
          {isDesktop ? desktopCards : <>{mobileCards}</>}
        </ScrollableSection>
      </HomeSectionRow>
    </>
  );
}
