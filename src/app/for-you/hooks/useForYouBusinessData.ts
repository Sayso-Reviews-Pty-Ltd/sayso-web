"use client";

import { useMemo } from 'react';
import type { Business } from '../../components/BusinessCard/BusinessCard';
import { ITEMS_PER_PAGE } from '../ForYouClient.constants';

export function useForYouBusinessData(
  businesses: Business[],
  prioritizedSearchResults: Business[],
  isSearchActive: boolean,
  currentPage: number
) {
  // Preserve backend ordering so API-side diversity (e.g., no repeated subcategory streaks)
  // remains intact across pagination.
  const prioritizedBusinesses = useMemo(() => businesses, [businesses]);

  const activeBusinesses = useMemo(
    () => (isSearchActive ? prioritizedSearchResults : prioritizedBusinesses),
    [isSearchActive, prioritizedSearchResults, prioritizedBusinesses]
  );

  const totalPages = useMemo(() => {
    return Math.ceil(activeBusinesses.length / ITEMS_PER_PAGE);
  }, [activeBusinesses.length]);

  const currentBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return activeBusinesses.slice(startIndex, endIndex);
  }, [activeBusinesses, currentPage]);

  const totalCount = useMemo(() => {
    return activeBusinesses.length;
  }, [activeBusinesses.length]);

  return {
    prioritizedBusinesses,
    activeBusinesses,
    totalPages,
    currentBusinesses,
    totalCount,
  };
}
