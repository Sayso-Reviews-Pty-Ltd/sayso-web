"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import BusinessCard from "../../components/BusinessCard/BusinessCard";
import Pagination from "../../components/EventsPage/Pagination";
import BusinessGridSkeleton from "../../components/Explore/BusinessGridSkeleton";
import { containerVariants, itemVariants } from "./ForYouAnimationVariants";
import type { Business } from "../../components/BusinessCard/BusinessCard";

interface ForYouResultsListProps {
  shouldShowSkeleton: boolean;
  canShowError: boolean;
  combinedError: string | null;
  onRetry: () => void;
  canRenderResults: boolean;
  totalCount: number;
  isSearchActive: boolean;
  debouncedSearchQuery: string;
  showOnboardingEmptyState: boolean;
  isFiltered: boolean;
  currentBusinesses: Business[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPaginationLoading: boolean;
  isDesktop: boolean;
  isMapMode: boolean;
}

export function ForYouResultsList({
  shouldShowSkeleton,
  canShowError,
  combinedError,
  onRetry,
  canRenderResults,
  totalCount,
  isSearchActive,
  debouncedSearchQuery,
  showOnboardingEmptyState,
  isFiltered,
  currentBusinesses,
  currentPage,
  totalPages,
  onPageChange,
  isPaginationLoading,
  isDesktop,
  isMapMode,
}: ForYouResultsListProps) {
  const desktopCards = useMemo(
    () => !isMapMode && isDesktop,
    [isMapMode, isDesktop]
  );

  if (shouldShowSkeleton) {
    return <BusinessGridSkeleton />;
  }

  if (canShowError) {
    return (
      <div className="bg-white border border-sage/20 rounded-3xl shadow-sm px-6 py-10 text-center space-y-4">
        <p className="text-charcoal font-semibold text-h2" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          We couldn't load businesses right now.
        </p>
        <p className="text-body-sm text-charcoal/60 max-w-[70ch]" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
          {combinedError}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-card-bg text-white hover:bg-card-bg/90 transition-colors text-body font-semibold"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!canRenderResults) {
    return null;
  }

  if (totalCount === 0) {
    if (isSearchActive) {
      return (
        <div className="w-full sm:max-w-md lg:max-w-lg xl:max-w-xl sm:mx-auto relative z-10">
          <div className="relative bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 rounded-[12px] overflow-hidden backdrop-blur-md shadow-md px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 xl:px-16 xl:py-12 text-center space-y-4">
            <h2 className="text-h2 font-semibold text-white" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              No results found
            </h2>
            <p className="text-body-sm text-white/80 max-w-[70ch] mx-auto leading-relaxed" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 400 }}>
              We couldn't find any businesses matching "{debouncedSearchQuery}". Try adjusting your search or check back soon.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-sage/20 rounded-3xl shadow-md px-6 py-16 text-center space-y-3">
        <h2 className="text-h2 font-semibold text-charcoal" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          {showOnboardingEmptyState
            ? 'Pick your interests to personalize For You'
            : isFiltered
              ? 'No businesses match your filters'
              : 'Curated from your interests'}
        </h2>
        <p className="text-body-sm text-charcoal/60 max-w-[70ch] mx-auto" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
          {showOnboardingEmptyState
            ? 'We need a few preferences before we can curate recommendations for you.'
            : isFiltered
              ? 'Try adjusting your filters or check back soon as new businesses join the community.'
              : 'No matches in your selected categories yet. Adjust your interests or check back as more businesses join.'}
        </p>
        {showOnboardingEmptyState ? (
          <div className="pt-2">
            <Link
              href="/interests"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-card-bg text-white hover:bg-card-bg/90 transition-colors text-body font-semibold"
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
              Select interests
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {isSearchActive && totalCount > 0 && (
        <div className="mb-4 px-2 flex items-center justify-between">
          <div className="text-sm text-charcoal/60" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Found {totalCount} {totalCount === 1 ? 'result' : 'results'} for "{debouncedSearchQuery}"
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {desktopCards ? (
          <m.div
            key={`list-view-desktop-${currentPage}-${isSearchActive ? "search" : "default"}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2"
          >
            {currentBusinesses.map((business) => (
              <m.div
                key={business.id}
                variants={itemVariants}
                className="list-none relative overflow-hidden desktop-card-shimmer"
              >
                <span aria-hidden className="desktop-shimmer-veil" />
                <div className="md:hidden w-full">
                  <BusinessCard business={business} compact />
                </div>
                <div className="hidden md:block">
                  <BusinessCard business={business} compact />
                </div>
              </m.div>
            ))}
          </m.div>
        ) : (
          <m.div
            key={`list-view-mobile-${currentPage}-${isSearchActive ? "search" : "default"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isPaginationLoading ? 0 : 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2">
              {currentBusinesses.map((business, index) => (
                <m.div
                  key={business.id}
                  className="list-none"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                    delay: index * 0.03,
                  }}
                >
                  <div className="md:hidden w-full">
                    <BusinessCard business={business} compact />
                  </div>
                  <div className="hidden md:block">
                    <BusinessCard business={business} compact />
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {!isMapMode && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={isPaginationLoading}
        />
      )}

      <style jsx>{`
        .desktop-card-shimmer {
          position: relative;
        }
        .desktop-card-shimmer .desktop-shimmer-veil {
          position: absolute;
          inset: -2px;
          pointer-events: none;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 65%, transparent 100%);
          opacity: 0.08;
          animation: desktopShimmer 10s linear infinite;
        }
        @keyframes desktopShimmer {
          0% { transform: translateX(-120%); }
          40% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </>
  );
}
