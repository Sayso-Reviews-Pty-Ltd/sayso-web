"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveSearch } from "../../hooks/useLiveSearch";

export function useHomeSearchState() {
  const searchParams = useSearchParams();
  const searchQueryParam = searchParams.get("search") || "";

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
    debounceMs: 250,
  });

  useEffect(() => {
    if (searchQueryParam !== liveQuery) {
      setQuery(searchQueryParam);
    }
  }, [searchQueryParam, liveQuery, setQuery]);

  const isSearchActive = useMemo(
    () => searchQueryParam.trim().length > 0 || liveQuery.trim().length > 0,
    [searchQueryParam, liveQuery]
  );
  const searchPanelQuery = liveQuery.trim() || searchQueryParam.trim();

  return {
    searchQueryParam,
    liveQuery,
    liveLoading,
    liveResults,
    liveError,
    liveFilters,
    setDistanceKm,
    setMinRating,
    resetFilters,
    isSearchActive,
    searchPanelQuery,
  };
}
