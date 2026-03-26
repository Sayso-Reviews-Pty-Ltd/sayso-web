"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/app/lib/icons";
import ScrollableSection from "../../ScrollableSection/ScrollableSection";
import ReviewerCard from "../../ReviewerCard/ReviewerCard";
import ReviewerCardSkeleton from "../../ReviewerCard/ReviewerCardSkeleton";
import type { Review, Reviewer } from "../../../types/community";
import { badgePreviews, sampleReviewTexts } from "../communityHighlights.constants";
import { HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS, HOME_SECTION_RAIL_CLASS } from "../../HomeSectionRow/homeSectionLayout";
import CardRail from "../../CardRail/CardRail";

interface TopContributorsSectionProps {
  hasReviewers: boolean;
  contributorsLoading: boolean;
  recentReviewsLoading: boolean;
  topReviewers: Reviewer[];
  reviews: Review[];
  contributorsHeadingMobile: string;
  contributorsHeadingDesktop: string;
  contributorsEmptyTitle: string;
  contributorsEmptyBody: string;
  hideCarouselArrowsOnDesktop: boolean;
  onSeeMoreContributors: () => void;
}

export default function TopContributorsSection({
  hasReviewers,
  contributorsLoading,
  recentReviewsLoading,
  topReviewers,
  reviews,
  contributorsHeadingMobile,
  contributorsHeadingDesktop,
  contributorsEmptyTitle,
  contributorsEmptyBody,
  hideCarouselArrowsOnDesktop,
  onSeeMoreContributors,
}: TopContributorsSectionProps) {
  const reviewerRailCardClass = `snap-start snap-always flex-shrink-0 h-full ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center`;

  return (
    <>
      {/* Top Reviewers */}
      {hasReviewers && (
        <div className="mt-1" aria-busy={recentReviewsLoading}>
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
              <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                <span className="sm:hidden">{contributorsHeadingMobile}</span>
                <span className="hidden sm:inline">{contributorsHeadingDesktop}</span>
              </span>
            </div>
            <button
              onClick={onSeeMoreContributors}
              className="group inline-flex items-center gap-1 text-body-sm sm:text-caption font-normal text-charcoal transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:text-sage focus:outline-none px-4 py-2 -mx-2 relative no-underline motion-reduce:transition-none"
              aria-label="See More: Top Contributors"
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 400 }}
            >
              <span className="relative z-10 transition-[color,transform] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-charcoal group-hover:text-sage group-hover:translate-x-[-1px] no-underline motion-reduce:transition-none" style={{ fontWeight: 400 }}>
                See More
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-[3px] text-charcoal group-hover:text-sage motion-reduce:transition-none" />
            </button>
          </div>

          <ScrollableSection hideArrowsOnDesktop={hideCarouselArrowsOnDesktop} className={HOME_SECTION_RAIL_CLASS}>
            <CardRail
              items={topReviewers}
              getKey={(r) => r.id}
              renderCard={(reviewer, index) => {
                const actualReview = reviews.find((r) => r.reviewer.id === reviewer.id);
                const reviewIndex = parseInt(reviewer.id) % sampleReviewTexts.length;
                const sampleText = sampleReviewTexts[reviewIndex];
                return (
                  <ReviewerCard
                    reviewer={reviewer}
                    variant="reviewer"
                    index={index}
                    latestReview={actualReview || {
                      id: `${reviewer.id}-latest`,
                      reviewer,
                      businessName: `${reviewer.location} Favorite`,
                      businessType: "Local Business",
                      rating: reviewer.rating,
                      reviewText: sampleText,
                      date: index < 3 ? `${index + 1} days ago` : `${index + 1} weeks ago`,
                      likes: Math.floor((reviewer.reviewCount * 0.3) + 5),
                    }}
                  />
                );
              }}
              cardClassName={reviewerRailCardClass}
              disableAnimations
              containerClassName="pt-2"
            />
          </ScrollableSection>
        </div>
      )}

      {/* Top Contributors Loading State (non-blocking for Featured Businesses) */}
      {!hasReviewers && contributorsLoading && (
        <div className="mt-1" aria-busy="true">
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
              <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                <span className="sm:hidden">{contributorsHeadingMobile}</span>
                <span className="hidden sm:inline">{contributorsHeadingDesktop}</span>
              </span>
            </div>
          </div>
          <ScrollableSection hideArrowsOnDesktop={hideCarouselArrowsOnDesktop} className={HOME_SECTION_RAIL_CLASS}>
            <CardRail
              items={Array.from({ length: 12 }, (_, i) => i)}
              getKey={(_, i) => `reviewer-skeleton-${i}`}
              renderCard={() => <ReviewerCardSkeleton />}
              cardClassName={reviewerRailCardClass}
              disableAnimations
              containerClassName="pt-2"
            />
          </ScrollableSection>
        </div>
      )}

      {/* Top Contributors Empty State */}
      {!hasReviewers && !contributorsLoading && (
        <div className="mt-1">
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
              <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                <span className="sm:hidden">{contributorsHeadingMobile}</span>
                <span className="hidden sm:inline">{contributorsHeadingDesktop}</span>
              </span>
            </div>
          </div>

          <div className="w-full bg-off-white border border-sage/20 rounded-3xl pt-16 pb-6 text-center space-y-3">
            <h2 className="text-h2 font-semibold text-charcoal" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              {contributorsEmptyTitle}
            </h2>
            <p className="text-body-sm text-charcoal/60 max-w-[70ch] mx-auto" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
              {contributorsEmptyBody}
            </p>
            <div className="pt-2 flex items-center justify-center">
              <Link
                href="/badges"
                className="mi-tap group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal text-white text-sm font-semibold shadow-md hover:bg-charcoal/90 transition"
                aria-label="Learn about badges"
              >
                <span>Explore badges</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Badge preview strip — pure CSS marquee at all breakpoints */}
            <div className="pt-5 w-[100vw] relative left-1/2 -translate-x-1/2 sm:w-auto sm:left-auto sm:translate-x-0">
              <div className="relative badge-marquee" aria-label="Badge previews">
                <div className="badge-track">
                  {[...badgePreviews, ...badgePreviews].map((badge, idx) => (
                    <div
                      key={`${badge.label}-${idx}`}
                      className="group relative flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-charcoal/10 px-4 py-2 shadow-md transition-transform duration-200 hover:-translate-y-0.5"
                      title={badge.description}
                      tabIndex={0}
                    >
                      <span
                        className="flex items-center justify-center w-5 h-5 flex-shrink-0"
                        aria-hidden
                      >
                        {badge.pngPath ? (
                          <Image
                            src={badge.pngPath}
                            alt=""
                            width={18}
                            height={18}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-base leading-none">{badge.fallbackIcon}</span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-charcoal/80 whitespace-nowrap">
                        {badge.label}
                      </span>

                      {/* Tooltip (desktop) */}
                      <div className="hidden md:block pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 translate-y-1 transition-all duration-200 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-focus:opacity-100 md:group-focus:translate-y-0">
                        <div className="rounded-xl bg-charcoal text-off-white text-xs font-medium px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-white/10 whitespace-nowrap">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                  .badge-marquee {
                    overflow: hidden;
                    scrollbar-width: none;
                  }
                  .badge-marquee::-webkit-scrollbar { display: none; }

                  .badge-track {
                    display: flex;
                    gap: 12px;
                    width: max-content;
                    padding: 0 6px 4px 6px;
                    align-items: center;
                    animation: badge-scroll 20s linear infinite;
                    will-change: transform;
                  }

                  @media (max-width: 767px) {
                    .badge-marquee {
                      /* Safari/Chrome mobile fallback: avoid mask clipping animated content */
                      mask-image: none;
                      -webkit-mask-image: none;
                    }
                    .badge-track {
                      animation-duration: 8s;
                    }
                  }

                  /* Pause on touch (mobile) and hover (desktop) */
                  .badge-marquee:active .badge-track {
                    animation-play-state: paused;
                  }

                  @media (min-width: 768px) {
                    .badge-marquee {
                      padding: 0 8px;
                      mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
                      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
                    }
                    .badge-track {
                      animation-duration: 22s;
                    }
                    .badge-marquee:hover .badge-track {
                      animation-play-state: paused;
                    }
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .badge-track { animation: none !important; }
                  }

                  @keyframes badge-scroll {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-50%, 0, 0); }
                  }
                `}} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
