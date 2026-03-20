"use client";

import { m } from "framer-motion";
import Footer from "../components/Footer/Footer";
import { usePredefinedPageTitle } from "../hooks/usePageTitle";
import type { Business } from "../components/BusinessCard/BusinessCard";
import type { UserPreferences } from "../hooks/useUserPreferences";
import { getChoreoItemMotion } from "../lib/motion/choreography";
import { useForYouClientState } from "./hooks/useForYouClientState";
import { ForYouGridLoadingOverlay } from "./parts/ForYouGridLoadingOverlay";
import { ForYouHeader } from "./parts/ForYouHeader";
import { ForYouMapDisplay } from "./parts/ForYouMapDisplay";
import { ForYouResultsList } from "./parts/ForYouResultsList";
import { ForYouSearchFilters } from "./parts/ForYouSearchFilters";

type ForYouClientProps = {
  initialBusinesses: Business[];
  initialPreferences: UserPreferences;
  initialPreferencesLoaded: boolean;
  initialOnboardingEmpty?: boolean;
  initialError?: string | null;
};

export default function ForYouClient({
  initialBusinesses,
  initialPreferences,
  initialPreferencesLoaded,
  initialOnboardingEmpty = false,
  initialError = null,
}: ForYouClientProps) {
  usePredefinedPageTitle("forYou");

  const {
    choreoEnabled,
    hasInitialBusinesses,
    prefsLoading,
    searchWrapRef,
    resultsContainerRef,
    filters,
    setFilters,
    handleInlineDistanceChange,
    handleInlineRatingChange,
    handleUpdateFilter,
    handleClearFilters,
    refetch,
    isSearchActive,
    debouncedSearchQuery,
    handleSearchChange,
    handleSubmitQuery,
    shouldShowSkeleton,
    canShowError,
    combinedError,
    canRenderResults,
    totalCount,
    showOnboardingEmptyState,
    isFiltered,
    isDesktop,
    isPaginationLoading,
    currentPage,
    totalPages,
    currentBusinesses,
    handlePageChange,
    isMapMode,
    setIsMapMode,
    mapBusinesses,
    usingCoordinateFallback,
    isMapFallbackLoading,
  } = useForYouClientState({
    initialBusinesses,
    initialPreferences,
    initialPreferencesLoaded,
    initialOnboardingEmpty,
    initialError,
  });

  const canToggleMap = canRenderResults && !combinedError && totalCount > 0;

  return (
    <div className="min-h-dvh bg-off-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

      <main className="relative">
        <div className="relative mx-auto w-full max-w-[2000px] px-2">
          <ForYouHeader
            choreoEnabled={choreoEnabled}
            prefsLoading={prefsLoading}
            hasInitialBusinesses={hasInitialBusinesses}
          />

          <ForYouSearchFilters
            choreoEnabled={choreoEnabled}
            onSearchChange={handleSearchChange}
            onSubmitQuery={handleSubmitQuery}
            isSearchActive={isSearchActive}
            debouncedSearchQuery={debouncedSearchQuery}
            filters={filters}
            onDistanceChange={(distance) => handleInlineDistanceChange(distance, refetch)}
            onRatingChange={(rating) => handleInlineRatingChange(rating, refetch)}
            onRemoveFilter={(filterType) => {
              setFilters({ ...filters, [filterType]: null });
              refetch();
            }}
            onUpdateFilter={(filterType, value) => handleUpdateFilter(filterType, value, refetch)}
            onClearAll={() => handleClearFilters(refetch)}
            searchWrapRef={searchWrapRef}
          />

          <m.div
            className="py-3 sm:py-4"
            {...getChoreoItemMotion({ order: 5, intent: "section", enabled: choreoEnabled })}
          >
            <div ref={resultsContainerRef} className="pt-4 sm:pt-6 md:pt-10">
              {canToggleMap && isPaginationLoading && !isMapMode && <ForYouGridLoadingOverlay />}

              {canToggleMap && (
                <ForYouMapDisplay
                  isMapMode={isMapMode}
                  onMapModeChange={setIsMapMode}
                  isMapFallbackLoading={isMapFallbackLoading}
                  mapBusinesses={mapBusinesses}
                  usingCoordinateFallback={usingCoordinateFallback}
                  currentPage={currentPage}
                  isSearchActive={isSearchActive}
                  isPaginationLoading={isPaginationLoading}
                  isDesktop={isDesktop}
                />
              )}

              {(!canToggleMap || !isMapMode) && (
                <ForYouResultsList
                  shouldShowSkeleton={shouldShowSkeleton}
                  canShowError={canShowError}
                  combinedError={combinedError}
                  onRetry={refetch}
                  canRenderResults={canRenderResults}
                  totalCount={totalCount}
                  isSearchActive={isSearchActive}
                  debouncedSearchQuery={debouncedSearchQuery}
                  showOnboardingEmptyState={showOnboardingEmptyState}
                  isFiltered={isFiltered}
                  currentBusinesses={currentBusinesses}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isPaginationLoading={isPaginationLoading}
                  isDesktop={isDesktop}
                  isMapMode={canToggleMap ? isMapMode : false}
                />
              )}
            </div>
          </m.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
