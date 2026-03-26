// ================================
// File: src/app/Home.tsx
// Description: Home page with smooth search transitions
// ================================

"use client";

import { useEffect, useMemo, useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { getChoreoItemMotion } from "../lib/motion/choreography";
import { usePredefinedPageTitle } from "../hooks/usePageTitle";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useForYouBusinesses, useTrendingBusinesses } from "../hooks/useBusinesses";
import { useFeaturedBusinesses } from "../hooks/useFeaturedBusinesses";
import { useRoutePrefetch } from "../hooks/useRoutePrefetch";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useAuth } from "../contexts/AuthContext";
import { HomeDiscoverySections } from "./HomeDiscoverySections";
import {
  CommunityHighlights,
  EventsSpecials,
  Footer,
  HeroCarousel,
  HeroSkeleton,
  MemoizedBusinessRow,
  MobileHeroSkeleton,
  SearchResultsPanel,
} from "./homeClient.components";
import { useHomeEventsSpecials } from "./hooks/useHomeEventsSpecials";
import { useHomeHeroReadiness } from "./hooks/useHomeHeroReadiness";
import { useHomeBusinessCountsDebug, useHomePreferencesDebug } from "./hooks/useHomeDebugLogs";
import { useHomeSearchState } from "./hooks/useHomeSearchState";
import { useHomeRealtimeFeedSync } from "./hooks/useHomeRealtimeFeedSync";

// Note: dynamic and revalidate cannot be exported from client components
// Client components are automatically dynamic

// Removed any animation / scroll-reveal classes and imports.


export default function HomeClient({ initialTrending }: { initialTrending?: import('../components/BusinessCard/BusinessCard').Business[] }) {
  const isDesktop = useIsDesktop();
  const isDev = process.env.NODE_ENV === "development";
  const prefersReducedMotion = useReducedMotion() ?? false;
  const choreoEnabled = !prefersReducedMotion;
  const { user } = useAuth();
  const { eventsAndSpecials, eventsAndSpecialsLoading } = useHomeEventsSpecials();

  usePredefinedPageTitle('home');
  const { heroReady } = useHomeHeroReadiness();
  const {
    liveLoading,
    liveResults,
    liveError,
    liveFilters,
    setDistanceKm,
    setMinRating,
    resetFilters,
    isSearchActive,
    searchPanelQuery,
  } = useHomeSearchState();
  // Ã¢Å“â€¦ USER PREFERENCES: From onboarding, persistent, used for personalization
  const { interests, subcategories, dealbreakers, loading: prefsLoading } = useUserPreferences();
  const preferences = useMemo(
    () => ({ interests, subcategories, dealbreakers }),
    [interests, subcategories, dealbreakers]
  );

  const {
    businesses: forYouBusinesses,
    loading: forYouLoading,
    error: forYouError,
    refetch: refetchForYou,
  } = useForYouBusinesses(20, undefined, {
    preferences,
    preferencesLoading: prefsLoading, // Wait for preference hydration to avoid double-fetching For You
    skip: !user, // Don't fetch For You when not signed in; section shows teaser only
  });

  const {
    businesses: trendingBusinesses,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingBusinesses({ fallbackData: initialTrending });

  useHomeRealtimeFeedSync({
    hasUser: Boolean(user),
    refetchTrending,
    refetchForYou,
  });

  useHomePreferencesDebug({ interests, subcategories, dealbreakers, isDev });

  // Fetch featured businesses from API
  const { featuredBusinesses, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useFeaturedBusinesses({
    limit: 12,
    region: null,
    skip: false,
    deferMs: 150, // Defer below-fold Community Highlights to prioritize For You / Trending
  });
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll to top when entering search mode
  useEffect(() => {
    if (isSearchActive && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSearchActive]);

  // Note: Prioritization of recently reviewed businesses is now handled on the backend
  // The API automatically prioritizes businesses the user has reviewed within the last 24 hours
  // Use featured businesses from API instead of client-side computation
  const featuredByCategory = featuredBusinesses;

  useHomeBusinessCountsDebug({
    forYouBusinesses,
    trendingBusinesses,
    forYouLoading,
    trendingLoading,
    forYouError,
    trendingError,
    featuredByCategory,
    featuredLoading,
    isDev,
  });

  useRoutePrefetch(
    [
      "/for-you",
      "/trending",
      "/discover/reviews",
      "/events-specials",
      "/write-review",
      "/saved",
    ],
    { delay: 1500 }
  );
  const hasTrendingBusinesses = trendingBusinesses.length > 0;

  return (
    <>
      <div suppressHydrationWarning className="min-h-dvh flex flex-col bg-off-white">
        {/* Hero Carousel - Hidden when search is active */}
        {!isSearchActive && (
          <div className="overflow-hidden">
            {heroReady ? (
              <HeroCarousel />
            ) : isDesktop ? (
              <HeroSkeleton />
            ) : (
              <MobileHeroSkeleton />
            )}
          </div>
        )}


        <main
          suppressHydrationWarning
          className={`relative min-h-dvh ${isSearchActive ? 'pt-2' : 'pt-8 sm:pt-10 md:pt-12'}`} 
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        >
          {/* Background Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />
          <div suppressHydrationWarning ref={contentRef} className="relative mx-auto w-full max-w-[2000px]">
            {isSearchActive ? (
              /* Search Results Mode */
              <m.div
                className="px-4 sm:px-6 lg:px-8 pb-8"
                {...getChoreoItemMotion({ order: 0, intent: "section", enabled: choreoEnabled })}
              >
                <SearchResultsPanel
                  query={searchPanelQuery}
                  loading={liveLoading}
                  error={liveError}
                  results={liveResults}
                  filters={liveFilters}
                  onDistanceChange={(value) => setDistanceKm(value)}
                  onRatingChange={(value) => setMinRating(value)}
                  onResetFilters={resetFilters}
                />
              </m.div>
            ) : (
              /* Discovery Mode - Default Home Page Content */
              <HomeDiscoverySections
                choreoEnabled={choreoEnabled}
                hasUser={Boolean(user)}
                forYouLoading={forYouLoading}
                forYouError={forYouError}
                forYouBusinesses={forYouBusinesses}
                trendingLoading={trendingLoading}
                trendingError={trendingError}
                hasTrendingBusinesses={hasTrendingBusinesses}
                trendingBusinesses={trendingBusinesses}
                featuredError={featuredError}
                featuredLoading={featuredLoading}
                featuredByCategory={Array.isArray(featuredByCategory) ? featuredByCategory : []}
                onRetryForYou={refetchForYou}
                onRetryTrending={refetchTrending}
                onRetryFeatured={refetchFeatured}
                renderBusinessRow={(props) => <MemoizedBusinessRow {...props} />}
                renderEventsSpecials={() => (
                  <EventsSpecials
                    events={eventsAndSpecials}
                    loading={eventsAndSpecialsLoading}
                    titleFontWeight={800}
                    ctaFontWeight={400}
                    premiumCtaHover
                    disableAnimations
                    enableMobilePeek
                  />
                )}
                renderCommunityHighlights={(businessesOfTheMonth) => (
                  <CommunityHighlights
                    businessesOfTheMonth={businessesOfTheMonth}
                    variant="reviews"
                    disableAnimations
                  />
                )}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>

    </>
  );
}
