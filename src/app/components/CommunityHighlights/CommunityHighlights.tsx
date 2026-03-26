// src/components/CommunityHighlights/CommunityHighlights.tsx
"use client";

import { useRouter } from "next/navigation";
import { useReviewersTop } from "../../hooks/useReviewersTop";
import { useRecentReviews } from "../../hooks/useRecentReviews";
import { m } from "framer-motion";
import CommunityHighlightsSkeleton from "./CommunityHighlightsSkeleton";
import type { Review, Reviewer } from "../../types/community";
import type { CommunityHighlightsProps } from "./CommunityHighlights.types";
import TopContributorsSection from "./components/TopContributorsSection";
import FeaturedBusinessesSection from "./components/FeaturedBusinessesSection";
import { SECTION_WRAPPER_CLASS } from "../HomeSectionRow/homeSectionLayout";

export default function CommunityHighlights({
  title = "Community Highlights",
  reviews: propReviews,
  topReviewers: propTopReviewers,
  businessesOfTheMonth,
  cta = "See More",
  href = "/leaderboard",
  variant = "reviews",
  disableAnimations = false,
  hideCarouselArrowsOnDesktop = false,
}: CommunityHighlightsProps) {
  const router = useRouter();

  // Fetch from API via SWR only when props are not provided
  const { reviewers: fetchedReviewers, mode: fetchedMode, loading: reviewersLoading } = useReviewersTop(12);
  const { reviews: fetchedReviews, loading: reviewsLoading } = useRecentReviews(10);

  const topReviewers: Reviewer[] = propTopReviewers ?? fetchedReviewers;
  const reviews: Review[] = propReviews ?? fetchedReviews;
  const reviewersMode: 'stage1' | 'normal' = fetchedMode;
  const hasBusinesses = Array.isArray(businessesOfTheMonth) && businessesOfTheMonth.length > 0;
  const contributorsLoading = !propTopReviewers && reviewersLoading;
  const recentReviewsLoading = !propReviews && reviewsLoading;

  // Keep legacy full-section skeleton when nothing else can render.
  if (contributorsLoading && !hasBusinesses) {
    return <CommunityHighlightsSkeleton />;
  }

  const hasReviewers = !!topReviewers && topReviewers.length > 5;
  const hasCoordinateBusinesses = (Array.isArray(businessesOfTheMonth) ? businessesOfTheMonth : []).some(
    (business) =>
      typeof business.lat === "number" && Number.isFinite(business.lat) &&
      typeof business.lng === "number" && Number.isFinite(business.lng)
  );
  const isStage1 = reviewersMode !== 'normal';

  const contributorsHeadingMobile = isStage1 ? 'Early Voices' : 'Top Contributors';
  const contributorsHeadingDesktop = isStage1 ? 'Early Community Voices' : 'Top Contributors This Month';
  const contributorsEmptyTitle = 'Be among the first voices shaping Sayso.';
  const contributorsEmptyBody = 'Write your first review and help set the standard for what’s worth discovering.';

  return (
    <section
      className="relative m-0 w-full pb-8 sm:pb-10 md:pb-12"
      aria-label={title}
      style={{
        fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >

      <div className={SECTION_WRAPPER_CLASS}>
        {/* Header */}
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          {disableAnimations ? (
            <h2
              className="font-urbanist text-2xl sm:text-3xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 py-1 hover:bg-card-bg/5 rounded-lg cursor-default"
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
              className="font-urbanist text-2xl sm:text-3xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 py-1 hover:bg-card-bg/5 rounded-lg cursor-default"
              style={{ 
                fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                fontWeight: 800,
              }}
            >
              {title}
            </m.h2>
          )}
        </div>

        <TopContributorsSection
          hasReviewers={hasReviewers}
          contributorsLoading={contributorsLoading}
          recentReviewsLoading={recentReviewsLoading}
          topReviewers={topReviewers}
          reviews={reviews}
          contributorsHeadingMobile={contributorsHeadingMobile}
          contributorsHeadingDesktop={contributorsHeadingDesktop}
          contributorsEmptyTitle={contributorsEmptyTitle}
          contributorsEmptyBody={contributorsEmptyBody}
          hideCarouselArrowsOnDesktop={hideCarouselArrowsOnDesktop}
          onSeeMoreContributors={() => router.push('/leaderboard?tab=contributors')}
        />

        <FeaturedBusinessesSection
          hasBusinesses={hasBusinesses}
          businessesOfTheMonth={businessesOfTheMonth}
          hasCoordinateBusinesses={hasCoordinateBusinesses}
          hideCarouselArrowsOnDesktop={hideCarouselArrowsOnDesktop}
          disableAnimations={disableAnimations}
          onSeeMoreBusinesses={() => router.push('/leaderboard?tab=businesses')}
        />
      </div>
    </section>
  );
}
