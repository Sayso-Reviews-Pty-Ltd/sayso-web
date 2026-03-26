"use client";

import React from "react";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import ReviewerCardSkeleton from "../ReviewerCard/ReviewerCardSkeleton";
import { HOME_SECTION_CONTAINER_INSET_CLASS, HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS } from "../HomeSectionRow/homeSectionLayout";

interface CommunityHighlightsSkeletonProps {
  reviewerCount?: number;
  businessCount?: number;
}

function BusinessOfTheMonthCardSkeleton() {
  return (
    <div
      className="snap-start snap-always flex-shrink-0 w-[100vw] sm:w-auto sm:w-[260px] md:w-[340px] list-none"
      style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
    >
      <div
        className="relative px-1 pt-1 pb-2 sm:pb-0 bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 rounded-[12px] overflow-visible w-full flex flex-col border-none backdrop-blur-xl shadow-md sm:h-auto animate-pulse"
        style={{ maxWidth: "540px" } as React.CSSProperties}
      >
        <div className="relative overflow-hidden z-10 rounded-t-[12px] h-[280px] sm:h-[220px] md:h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-off-white/90 via-off-white/80 to-off-white/70" />
        </div>
        <div className="px-4 py-3 sm:px-5 sm:pt-1 md:pt-2 lg:pt-3 pb-0 flex-1 relative flex-shrink-0 flex flex-col justify-between bg-card-bg/10 z-10 rounded-b-[12px]">
          <div className="flex-1 flex flex-col items-center text-center space-y-1">
            <div className="h-6 sm:h-7 w-3/4 bg-charcoal/10 rounded-lg mx-auto" />
            <div className="h-4 w-1/2 bg-charcoal/5 rounded mx-auto" />
            <div className="h-4 w-2/3 bg-charcoal/5 rounded mx-auto mt-2" />
            <div className="h-4 w-20 bg-charcoal/5 rounded mx-auto mt-2" />
          </div>
          <div className="flex md:hidden items-center justify-center pt-4 border-t border-off-white/30">
            <div className="h-12 w-24 bg-charcoal/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for CommunityHighlights — structure matches the real section exactly.
 */
export default function CommunityHighlightsSkeleton({
  reviewerCount = 12,
  businessCount = 4,
}: CommunityHighlightsSkeletonProps) {
  const reviewerCardClass = `snap-start snap-always flex-shrink-0 ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center`;
  const businessCardClass = `snap-start snap-always flex-shrink-0 ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center business-month-card-full-width`;

  const reviewerSlides = Array.from({ length: reviewerCount }, (_, idx) => (
    <div key={idx} className={reviewerCardClass}>
      <ReviewerCardSkeleton />
    </div>
  ));

  const businessSlides = Array.from({ length: businessCount }, (_, idx) => (
    <div key={idx} className={businessCardClass}>
      <BusinessOfTheMonthCardSkeleton />
    </div>
  ));

  return (
    <section
      className="relative m-0 w-full"
      aria-label="Community Highlights loading"
      aria-busy="true"
      style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
    >
      <div className={`mx-auto w-full max-w-[2000px] relative z-10 ${HOME_SECTION_CONTAINER_INSET_CLASS}`}>
        {/* Main header */}
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          <div className="h-8 sm:h-10 w-48 sm:w-64 bg-charcoal/10 rounded-lg animate-pulse px-3 sm:px-4 py-1" />
        </div>

        {/* Top Contributors */}
        <div className="mt-1">
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="h-5 w-56 sm:w-64 bg-charcoal/10 rounded-lg animate-pulse px-3 sm:px-4 py-1" />
            <div className="inline-flex items-center gap-1 px-4 py-2 -mx-2">
              <div className="h-4 w-16 bg-charcoal/10 rounded-full animate-pulse" />
              <div className="h-4 w-4 bg-charcoal/10 rounded-full animate-pulse" />
            </div>
          </div>
          <ScrollableSection items={reviewerSlides} />
        </div>

        {/* Featured Businesses */}
        <section className="relative m-0 p-0 w-full mt-3 list-none" aria-hidden>
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="h-5 w-48 sm:w-72 bg-charcoal/10 rounded-lg animate-pulse px-3 sm:px-4 py-1" />
            <div className="inline-flex items-center gap-1 px-4 py-2 -mx-2">
              <div className="h-4 w-16 bg-charcoal/10 rounded-full animate-pulse" />
              <div className="h-4 w-4 bg-charcoal/10 rounded-full animate-pulse" />
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 639px) {
              .business-month-card-full-width > div {
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `}} />
          <ScrollableSection items={businessSlides} enableMobilePeek />
        </section>
      </div>
    </section>
  );
}
