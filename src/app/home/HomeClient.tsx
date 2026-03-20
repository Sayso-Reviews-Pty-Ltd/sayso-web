// ================================
// File: src/app/Home.tsx
// Description: Home page with smooth search transitions
// ================================

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { getChoreoItemMotion } from "../lib/motion/choreography";
import { useSearchParams } from "next/navigation";
import { usePredefinedPageTitle } from "../hooks/usePageTitle";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useBusinesses, useForYouBusinesses, useTrendingBusinesses } from "../hooks/useBusinesses";
import { getBrowserSupabase } from "../lib/supabase/client";
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
import { useHomeFilterState } from "./hooks/useHomeFilterState";
import { useHomeHeroReadiness } from "./hooks/useHomeHeroReadiness";
import { useHomeBusinessCountsDebug, useHomePreferencesDebug } from "./hooks/useHomeDebugLogs";
import { useLiveSearch } from "../hooks/useLiveSearch";

// Note: dynamic and revalidate cannot be exported from client components
// Client components are automatically dynamic

// Removed any animation / scroll-reveal classes and imports.


export default function HomeClient({ initialTrending }: { initialTrending?: import('../components/BusinessCard/BusinessCard').Business[] }) {
  const isDesktop = useIsDesktop();
  const isDev = process.env.NODE_ENV === "development";
  const prefersReducedMotion = useReducedMotion() ?? false;
  const choreoEnabled = !prefersReducedMotion;
  const { eventsAndSpecials, eventsAndSpecialsLoading } = useHomeEventsSpecials();

  // Ã¢â€â‚¬Ã¢â€â‚¬ Realtime: refresh feed sections when any new review is inserted Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // Keep a ref to the latest refetch callbacks so the channel doesn't need
  // to be recreated when user auth state or SWR mutate identity changes.
  const supabaseHomeRef = useRef(getBrowserSupabase());
  const refetchFeedsRef = useRef<() => void>(() => {});
  refetchFeedsRef.current = () => {
    refetchTrending();
    if (user) refetchForYou();
  };

  useEffect(() => {
    const supabase = supabaseHomeRef.current;
    const channel = supabase
      .channel('home-reviews-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, () => {
        refetchFeedsRef.current();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); // subscribe once on mount

  usePredefinedPageTitle('home');
  const { heroReady } = useHomeHeroReadiness();

  const searchParams = useSearchParams();
  const searchQueryParam = searchParams.get('search') || "";
  const { user } = useAuth();

  const {
    query: liveQuery,
    setQuery,
    loading: liveLoading,
    results: liveResults,
    error: liveError,
    filters: liveFilters,
    setDistanceKm,
    setMinRating,
    resetFilters,
  } = useLiveSearch({
    initialQuery: searchQueryParam,
    debounceMs: 250, // Fast live search
  });

  // Sync URL param with live search
  useEffect(() => {
    if (searchQueryParam !== liveQuery) {
      setQuery(searchQueryParam);
    }
  }, [searchQueryParam, liveQuery, setQuery]);

  const {
    isFiltered,
    userLocation,
    handleInlineDistanceChange,
    handleInlineRatingChange,
    handleFiltersChange,
    handleClearFilters,
    handleUpdateFilter,
    handleToggleInterest,
  } = useHomeFilterState({
    isDev,
    refetchAllBusinesses: () => refetchAllBusinesses(),
  });
  // Ã¢Å“â€¦ USER PREFERENCES: From onboarding, persistent, used for personalization
  const { interests, subcategories, dealbreakers, loading: prefsLoading } = useUserPreferences();
  const preferences = useMemo(
    () => ({ interests, subcategories, dealbreakers }),
    [interests, subcategories, dealbreakers]
  );
  // Destructure and alias refetch functions from business hooks
  const {
    businesses: allBusinesses,
    loading: allBusinessesLoading,
    refetch: refetchAllBusinesses,
  } = useBusinesses({
    // Filtered results section is hidden by default; avoid fetching it on first paint.
    skip: !isFiltered,
  });

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
    statusCode: trendingStatus,
    refetch: refetchTrending,
  } = useTrendingBusinesses({ fallbackData: initialTrending });

  useHomePreferencesDebug({ interests, subcategories, dealbreakers, isDev });

  // Fetch featured businesses from API
  const { featuredBusinesses, loading: featuredLoading, error: featuredError, statusCode: featuredStatus, refetch: refetchFeatured } = useFeaturedBusinesses({
    limit: 12,
    region: userLocation ? 'Cape Town' : null, // TODO: Get actual region from user location
    skip: false,
    deferMs: 150, // Defer below-fold Community Highlights to prioritize For You / Trending
  });

  // Note: Visibility-based refetch is handled by each hook (useBusinesses, useForYouBusinesses,
  // useTrendingBusinesses, useFeaturedBusinesses) to avoid duplicate listeners and requests.

  // Search is active when there's a query in the URL or live query
  const isSearchActive = searchQueryParam.trim().length > 0 || liveQuery.trim().length > 0;
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
    allBusinesses,
    forYouLoading,
    trendingLoading,
    allBusinessesLoading,
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
                  query={liveQuery.trim() || searchQueryParam.trim()}
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
                isFiltered={isFiltered}
                hasUser={Boolean(user)}
                forYouLoading={forYouLoading}
                forYouError={forYouError}
                forYouBusinesses={forYouBusinesses}
                allBusinessesLoading={allBusinessesLoading}
                allBusinesses={allBusinesses}
                trendingLoading={trendingLoading}
                trendingError={trendingError}
                trendingStatus={trendingStatus ?? null}
                hasTrendingBusinesses={hasTrendingBusinesses}
                trendingBusinesses={trendingBusinesses}
                featuredError={featuredError}
                featuredLoading={featuredLoading}
                featuredStatus={featuredStatus ?? null}
                featuredByCategory={Array.isArray(featuredByCategory) ? featuredByCategory : []}
                onRetryForYou={refetchForYou}
                onRetryTrending={refetchTrending}
                onRetryFeatured={refetchFeatured}
                renderBusinessRow={(props) => <MemoizedBusinessRow {...props} loop />}
                renderEventsSpecials={() => (
                  <EventsSpecials
                    events={eventsAndSpecials}
                    loading={eventsAndSpecialsLoading}
                    titleFontWeight={800}
                    ctaFontWeight={400}
                    premiumCtaHover
                    disableAnimations
                    loop
                  />
                )}
                renderCommunityHighlights={(businessesOfTheMonth) => (
                  <CommunityHighlights
                    businessesOfTheMonth={businessesOfTheMonth}
                    variant="reviews"
                    disableAnimations
                    loopFeaturedRail
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
