"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { m } from "framer-motion";

import { getChoreoItemMotion } from "../lib/motion/choreography";
import BusinessRowSkeleton from "../components/BusinessRow/BusinessRowSkeleton";
import CommunityHighlightsSkeleton from "../components/CommunityHighlights/CommunityHighlightsSkeleton";
import type { Business } from "../components/BusinessCard/BusinessCard";
import type { FeaturedBusiness } from "../hooks/useFeaturedBusinesses";
import { P } from "@/app/components/ui/typography";
import { ArrowRight } from "@/app/lib/icons";

type BusinessRowComponentProps = {
  title: string;
  businesses: Business[];
  cta: string;
  href: string;
  disableAnimations?: boolean;
};

type HomeDiscoverySectionsProps = {
  choreoEnabled: boolean;
  hasUser: boolean;
  forYouLoading: boolean;
  forYouError: string | null;
  forYouBusinesses: Business[];
  trendingLoading: boolean;
  trendingError: string | null;
  hasTrendingBusinesses: boolean;
  trendingBusinesses: Business[];
  featuredError: string | null;
  featuredLoading: boolean;
  featuredByCategory: FeaturedBusiness[];
  onRetryForYou?: () => void;
  onRetryTrending?: () => void;
  onRetryFeatured?: () => void;
  renderBusinessRow: (props: BusinessRowComponentProps) => ReactNode;
  renderEventsSpecials: () => ReactNode;
  renderCommunityHighlights: (featuredByCategory: FeaturedBusiness[]) => ReactNode;
};

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal text-white text-sm font-urbanist font-semibold shadow-sm hover:bg-charcoal/90 transition-colors duration-200"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      Reload
    </button>
  );
}

export function HomeDiscoverySections({
  choreoEnabled,
  hasUser,
  forYouLoading,
  forYouError,
  forYouBusinesses,
  trendingLoading,
  trendingError,
  hasTrendingBusinesses,
  trendingBusinesses,
  featuredError,
  featuredLoading,
  featuredByCategory,
  onRetryForYou,
  onRetryTrending,
  onRetryFeatured,
  renderBusinessRow,
  renderEventsSpecials,
  renderCommunityHighlights,
}: HomeDiscoverySectionsProps) {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 pt-0">
      <m.div
        className="relative z-10 snap-start"
        {...getChoreoItemMotion({ order: 0, intent: "section", enabled: choreoEnabled })}
      >
        {!hasUser ? (
          <div className="mx-auto w-full max-w-[2000px] px-2 pt-4 sm:pt-8 md:pt-10">
            <div className="bg-off-white border border-sage/20 rounded-[12px] pt-16 pb-6 text-center space-y-3">
              <h2 className="font-urbanist text-h2 font-semibold text-charcoal">For You</h2>
              <p
                className="font-urbanist text-body-sm text-charcoal/60 mx-auto max-w-[34ch] sm:max-w-[70ch] px-4 sm:px-0 leading-relaxed break-words text-center"
                style={{ fontWeight: 500 }}
              >
                Create an account to unlock personalised recommendations.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="mi-tap group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal text-white text-sm font-semibold shadow-md hover:bg-charcoal/90 transition"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/onboarding"
                  className="mi-tap inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal/15 bg-white text-charcoal text-sm font-semibold shadow-sm hover:bg-off-white transition"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {forYouLoading ? (
              <BusinessRowSkeleton title="For You Now" />
            ) : forYouError ? (
              <div className="mx-auto w-full max-w-[2000px] px-2 py-4 flex items-center justify-between gap-4">
                <P className="text-sm text-coral">
                  Couldn&apos;t load personalised picks right now.
                </P>
                {onRetryForYou && <RetryButton onRetry={onRetryForYou} />}
              </div>
            ) : forYouBusinesses.length > 0 ? (
              renderBusinessRow({
                title: "For You",
                businesses: forYouBusinesses,
                cta: "See More",
                href: "/for-you",
                disableAnimations: true,
              })
            ) : (
              <div className="mx-auto w-full max-w-[2000px] px-2 py-4">
                <div className="bg-off-white border border-sage/20 rounded-[12px] pt-16 pb-6 text-center space-y-3">
                  <h2 className="font-urbanist text-h2 font-semibold text-charcoal">
                    Curated from your interests
                  </h2>
                  <p
                    className="font-urbanist text-body-sm text-charcoal/60 max-w-[70ch] mx-auto"
                    style={{ fontWeight: 500 }}
                  >
                    Based on what you selected, no matches in this section yet. See more on For You
                    or explore Trending.
                  </p>
                  <div className="pt-2 flex items-center justify-center">
                    <Link
                      href="/for-you"
                      className="mi-tap group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal text-white text-sm font-semibold shadow-md hover:bg-charcoal/90 transition"
                    >
                      <span>Explore For You</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </m.div>

      <m.div
        className="relative z-10 snap-start"
        {...getChoreoItemMotion({ order: 1, intent: "section", enabled: choreoEnabled })}
      >
        {trendingLoading && <BusinessRowSkeleton title="Trending Now" />}
        {!trendingLoading &&
          hasTrendingBusinesses &&
          renderBusinessRow({
            title: "Trending Now",
            businesses: trendingBusinesses,
            cta: "See More",
            href: "/trending",
            disableAnimations: true,
          })}
        {!trendingLoading &&
          !hasTrendingBusinesses &&
          !trendingError &&
          renderBusinessRow({
            title: "Trending Now",
            businesses: [],
            cta: "See More",
            href: "/trending",
            disableAnimations: true,
          })}
        {trendingError && !trendingLoading && (
          <div className="mx-auto w-full max-w-[2000px] px-2 py-4 flex items-center justify-between gap-4">
            <P className="text-sm text-coral">Couldn&apos;t load Trending right now.</P>
            {onRetryTrending && <RetryButton onRetry={onRetryTrending} />}
          </div>
        )}
      </m.div>

      <m.div
        className="relative z-10 snap-start"
        {...getChoreoItemMotion({ order: 2, intent: "section", enabled: choreoEnabled })}
      >
        {renderEventsSpecials()}
      </m.div>

      <m.div
        className="relative z-10 snap-start"
        {...getChoreoItemMotion({ order: 3, intent: "section", enabled: choreoEnabled })}
      >
        {featuredError && !featuredLoading ? (
          <div className="mx-auto w-full max-w-[2000px] px-2 py-4 flex items-center justify-between gap-4">
            <P className="text-sm text-coral">Couldn&apos;t load Community Highlights right now.</P>
            {onRetryFeatured && <RetryButton onRetry={onRetryFeatured} />}
          </div>
        ) : featuredLoading ? (
          <CommunityHighlightsSkeleton reviewerCount={12} businessCount={4} />
        ) : (
          renderCommunityHighlights(featuredByCategory)
        )}
      </m.div>
    </div>
  );
}
