"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useForYouBusinesses } from "../../hooks/useBusinesses";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import type { Business } from "../../components/BusinessCard/BusinessCard";
import type { UserPreferences } from "../../hooks/useUserPreferences";
import { useForYouFilters } from "./useForYouFilters";
import { useForYouPagination } from "./useForYouPagination";
import { useForYouMapData } from "./useForYouMapData";
import { useForYouSearch } from "./useForYouSearch";
import { useForYouBusinessData } from "./useForYouBusinessData";
import { useForYouDebug } from "./useForYouDebug";

interface UseForYouClientStateParams {
  initialBusinesses: Business[];
  initialPreferences: UserPreferences;
  initialPreferencesLoaded: boolean;
  initialOnboardingEmpty: boolean;
  initialError: string | null;
}

export function useForYouClientState({
  initialBusinesses,
  initialPreferences,
  initialPreferencesLoaded,
  initialOnboardingEmpty,
  initialError,
}: UseForYouClientStateParams) {
  const { interests, subcategories, dealbreakers, loading: prefsLoading } = useUserPreferences({
    initialData: initialPreferences,
    skipInitialFetch: initialPreferencesLoaded,
  });
  const hasInitialBusinesses = initialBusinesses.length > 0;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const choreoEnabled = !prefersReducedMotion;
  const preferences = useMemo(
    () => ({ interests, subcategories, dealbreakers }),
    [interests, subcategories, dealbreakers]
  );

  const [isDesktop, setIsDesktop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false);
  const [hasClientFetchSettled, setHasClientFetchSettled] = useState(
    hasInitialBusinesses || initialOnboardingEmpty
  );
  const showDebugInfo = process.env.NODE_ENV !== "production";

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const hasClientLoadingCycleRef = useRef(false);

  const {
    selectedInterestIds,
    hasUserInitiatedFilters,
    filters,
    userLocation,
    handleClearFilters,
    handleInlineDistanceChange,
    handleInlineRatingChange,
    handleUpdateFilter,
    setFilters,
  } = useForYouFilters();

  const {
    currentPage,
    setCurrentPage,
    isPaginationLoading,
    handlePageChange,
  } = useForYouPagination();

  const {
    debouncedSearchQuery,
    isSearchActive,
    simpleSearchLoading,
    sortStrategy,
    prioritizedSearchResults,
  } = useForYouSearch(searchQuery);

  const isFiltered = useMemo(() => {
    return (
      hasUserInitiatedFilters &&
      (selectedInterestIds.length > 0 || filters.minRating !== null || filters.distance !== null)
    );
  }, [hasUserInitiatedFilters, selectedInterestIds.length, filters.minRating, filters.distance]);

  const preferenceInterestIds = useMemo(() => {
    const userInterestIds = interests.map((i) => i.id).concat(subcategories.map((s) => s.id));
    return userInterestIds.length > 0 ? userInterestIds : undefined;
  }, [interests, subcategories]);

  const activeInterestIds = useMemo(() => {
    if (hasUserInitiatedFilters && selectedInterestIds.length > 0) {
      return selectedInterestIds;
    }
    return preferenceInterestIds;
  }, [hasUserInitiatedFilters, selectedInterestIds, preferenceInterestIds]);

  const radiusKm = useMemo(() => {
    if (!filters.distance) return null;
    const match = filters.distance.match(/(\d+)\s*km/);
    return match ? parseInt(match[1], 10) : null;
  }, [filters.distance]);

  const shouldSkipForYouFetch = initialOnboardingEmpty && !isSearchActive && !hasUserInitiatedFilters;
  const { businesses, loading, error, refetch } = useForYouBusinesses(
    120,
    debouncedSearchQuery.trim().length > 0 ? activeInterestIds : preferenceInterestIds,
    {
      sortBy: "created_at",
      sortOrder: "desc",
      feedStrategy: debouncedSearchQuery.trim().length > 0 ? "standard" : "mixed",
      minRating: filters.minRating,
      radiusKm,
      latitude: userLocation?.lat ?? null,
      longitude: userLocation?.lng ?? null,
      searchQuery: debouncedSearchQuery.trim().length > 0 ? debouncedSearchQuery : null,
      sort: sortStrategy,
      skip: shouldSkipForYouFetch,
      initialBusinesses,
      skipInitialFetch: hasInitialBusinesses,
      preferences,
      preferencesLoading: prefsLoading,
    }
  );

  useEffect(() => {
    if (shouldSkipForYouFetch) {
      if (!hasClientFetchSettled) setHasClientFetchSettled(true);
      return;
    }

    if (hasInitialBusinesses) {
      if (!hasClientFetchSettled) {
        setHasClientFetchSettled(true);
      }
      return;
    }

    if (businesses.length > 0 && !hasClientFetchSettled) {
      setHasClientFetchSettled(true);
      return;
    }

    if (loading) {
      hasClientLoadingCycleRef.current = true;
      return;
    }

    if (hasClientLoadingCycleRef.current && !loading && !hasClientFetchSettled) {
      setHasClientFetchSettled(true);
    }
  }, [businesses.length, hasClientFetchSettled, hasInitialBusinesses, loading, shouldSkipForYouFetch]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && refetch) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  const combinedError = error ?? (hasClientFetchSettled ? null : initialError);
  const shouldShowSkeleton =
    !hasInitialBusinesses && (!hasClientFetchSettled || loading || prefsLoading || simpleSearchLoading);
  const canRenderResults = hasClientFetchSettled && !simpleSearchLoading && (!prefsLoading || hasInitialBusinesses);
  const canShowError = !!combinedError && !loading && canRenderResults;

  const { activeBusinesses, totalPages, currentBusinesses, totalCount } = useForYouBusinessData(
    businesses,
    prioritizedSearchResults as unknown as Business[],
    isSearchActive,
    currentPage
  );

  const showOnboardingEmptyState = initialOnboardingEmpty && !isSearchActive && !isFiltered && totalCount === 0;

  useForYouDebug(
    showDebugInfo,
    totalCount,
    loading,
    prefsLoading,
    simpleSearchLoading,
    combinedError,
    shouldShowSkeleton,
    canRenderResults,
    canShowError,
    isMapMode,
    resultsContainerRef,
    isPaginationLoading
  );

  const shouldFetchCoordinateFallback =
    isMapMode && !isSearchActive && !loading && !prefsLoading && activeBusinesses.length > 0;

  const { businesses: coordinateFallbackBusinesses, loading: coordinateFallbackLoading } = useForYouBusinesses(
    120,
    debouncedSearchQuery.trim().length > 0 ? activeInterestIds : preferenceInterestIds,
    {
      sortBy: "created_at",
      sortOrder: "desc",
      feedStrategy: "mixed",
      minRating: filters.minRating,
      radiusKm,
      latitude: userLocation?.lat ?? null,
      longitude: userLocation?.lng ?? null,
      requireCoordinates: true,
      skip: !shouldFetchCoordinateFallback,
      preferences,
      preferencesLoading: prefsLoading,
    }
  );

  const { mapBusinesses, usingCoordinateFallback } = useForYouMapData(activeBusinesses, coordinateFallbackBusinesses);
  const isMapFallbackLoading = shouldFetchCoordinateFallback && coordinateFallbackLoading && mapBusinesses.length === 0;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query !== debouncedSearchQuery) {
      setCurrentPage(1);
    }
  };

  const handleSubmitQuery = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(typeof window !== "undefined" && window.innerWidth >= 1024);
    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);
    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

  return {
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
  };
}
