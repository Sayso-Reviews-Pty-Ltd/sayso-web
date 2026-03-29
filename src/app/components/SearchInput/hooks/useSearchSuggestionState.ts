"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveSearch, type LiveSearchResult } from "../../../hooks/useLiveSearch";
import { useSearchSuggestions } from "../../../hooks/useSearchSuggestions";

interface CustomSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  typeLabel?: string;
}

interface UseSearchSuggestionStateProps {
  enableSuggestions: boolean;
  suggestionsMode: "business" | "custom";
  maxSuggestions: number;
  customSuggestions: CustomSuggestion[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch?: (query: string) => void;
  onSubmitQuery?: (query: string) => void;
}

export function useSearchSuggestionState({
  enableSuggestions,
  suggestionsMode,
  maxSuggestions,
  customSuggestions,
  searchQuery,
  setSearchQuery,
  onSearch,
  onSubmitQuery,
}: UseSearchSuggestionStateProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);
  const dismissedQueryRef = useRef<string | null>(null);

  const {
    setQuery: setLiveQuery,
    loading: liveLoading,
    results: liveResults,
  } = useLiveSearch({
    initialQuery: "",
    debounceMs: 120,
  });

  const { suggestions: querySuggestions } = useSearchSuggestions({
    query: enableSuggestions && suggestionsMode === "business" ? searchQuery : "",
    debounceMs: 200,
  });

  useEffect(() => {
    if (!enableSuggestions) return;
    if (suggestionsMode !== "business") return;
    setLiveQuery(searchQuery);
  }, [enableSuggestions, suggestionsMode, searchQuery, setLiveQuery]);

  useEffect(() => {
    const timeout = blurTimeoutRef;
    return () => {
      if (timeout.current != null) {
        window.clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, []);

  const businessSuggestions = useMemo(() => {
    if (!enableSuggestions || suggestionsMode !== "business") return [];
    const list = Array.isArray(liveResults) ? liveResults : [];
    return list.slice(0, Math.max(1, maxSuggestions));
  }, [enableSuggestions, suggestionsMode, liveResults, maxSuggestions]);

  const normalizedCustomSuggestions = useMemo(() => {
    if (!enableSuggestions || suggestionsMode !== "custom") return [];
    return (Array.isArray(customSuggestions) ? customSuggestions : []).slice(
      0,
      Math.max(1, maxSuggestions)
    );
  }, [enableSuggestions, suggestionsMode, customSuggestions, maxSuggestions]);

  const isOpen =
    enableSuggestions &&
    isFocused &&
    searchQuery.trim().length > 0 &&
    dismissedQueryRef.current !== searchQuery &&
    (suggestionsMode === "business"
      ? liveLoading || businessSuggestions.length > 0 || querySuggestions.length > 0
      : normalizedCustomSuggestions.length > 0);

  const onSelectQuerySuggestion = useCallback(
    (q: string) => {
      setSearchQuery(q);
      onSearch?.(q);
      onSubmitQuery?.(q);
      setIsFocused(false);
      setActiveIndex(-1);
    },
    [setSearchQuery, onSearch, onSubmitQuery]
  );

  const onSelectBusiness = useCallback(
    (item: LiveSearchResult) => {
      if (!item?.id) return;
      setIsFocused(false);
      setActiveIndex(-1);
      router.push(`/business/${item.id}`);
    },
    [router]
  );

  const onSelectCustom = useCallback(
    (item: CustomSuggestion) => {
      setIsFocused(false);
      setActiveIndex(-1);
      if (item.href) {
        router.push(item.href);
        return;
      }
      setSearchQuery(item.title);
      onSearch?.(item.title);
      onSubmitQuery?.(item.title);
    },
    [router, setSearchQuery, onSearch, onSubmitQuery]
  );

  const dismissSuggestions = useCallback(() => {
    dismissedQueryRef.current = searchQuery;
    setIsFocused(false);
    setActiveIndex(-1);
    if (blurTimeoutRef.current != null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, [searchQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!enableSuggestions || !isOpen) return;
      const max =
        suggestionsMode === "business"
          ? businessSuggestions.length
          : normalizedCustomSuggestions.length;
      if (max === 0) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setIsFocused(false);
        setActiveIndex(-1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % max);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + max) % max);
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        if (suggestionsMode === "business") {
          const chosen = businessSuggestions[activeIndex];
          if (chosen) onSelectBusiness(chosen);
        } else {
          const chosen = normalizedCustomSuggestions[activeIndex];
          if (chosen) onSelectCustom(chosen);
        }
      }
    },
    [
      enableSuggestions,
      isOpen,
      suggestionsMode,
      businessSuggestions,
      normalizedCustomSuggestions,
      activeIndex,
      onSelectBusiness,
      onSelectCustom,
    ]
  );

  return {
    activeIndex,
    setActiveIndex,
    isFocused,
    setIsFocused,
    blurTimeoutRef,
    dismissedQueryRef,
    liveLoading,
    businessSuggestions,
    normalizedCustomSuggestions,
    querySuggestions,
    isOpen,
    onSelectQuerySuggestion,
    onSelectBusiness,
    onSelectCustom,
    dismissSuggestions,
    handleKeyDown,
  };
}
