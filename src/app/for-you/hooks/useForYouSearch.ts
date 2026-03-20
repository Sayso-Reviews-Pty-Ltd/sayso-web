"use client";

import { useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useSimpleBusinessSearch } from '../../hooks/useSimpleBusinessSearch';
import type { Business } from '../../components/BusinessCard/BusinessCard';
import { sortBusinessesByPriority } from '../../utils/businessPrioritization';

export function useForYouSearch(searchQuery: string) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearchActive = debouncedSearchQuery.trim().length > 1;

  const { results: searchResults, isSearching: simpleSearchLoading } = useSimpleBusinessSearch(
    debouncedSearchQuery,
    300
  );

  const sortStrategy = useMemo((): 'relevance' | 'distance' | 'rating_desc' | 'price_asc' | 'combo' | undefined => {
    if (debouncedSearchQuery.trim().length > 0) {
      return 'relevance';
    }
    return undefined;
  }, [debouncedSearchQuery]);

  const prioritizedSearchResults = useMemo(() => sortBusinessesByPriority(searchResults), [searchResults]);

  return {
    debouncedSearchQuery,
    isSearchActive,
    searchResults,
    simpleSearchLoading,
    sortStrategy,
    prioritizedSearchResults,
  };
}
