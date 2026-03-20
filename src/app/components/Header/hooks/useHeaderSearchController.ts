"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useLiveSearch,
  type EventSearchResult,
  type LiveSearchResult,
  type SpecialSearchResult,
} from "../../../hooks/useLiveSearch";
import { useSearchSuggestions, type QuerySuggestion } from "../../../hooks/useSearchSuggestions";

interface UseHeaderSearchControllerOptions {
  pathname: string;
  isHomePage: boolean;
  isPersonalLayout: boolean;
  isGuest: boolean;
}

export interface HeaderSearchController {
  urlSearchQuery: string;
  headerSearchQuery: string;
  headerPlaceholder: string;
  isMobileSearchOpen: boolean;
  isDesktopSearchExpanded: boolean;
  activeSuggestionIndex: number;
  desktopSearchExpandedWidth: number;
  isSearchActive: boolean;
  suggestionsLoading: boolean;
  cappedSuggestions: LiveSearchResult[];
  querySuggestions: QuerySuggestion[];
  cappedEventResults: EventSearchResult[];
  cappedSpecialResults: SpecialSearchResult[];
  isSuggestionsOpen: boolean;
  inputRef: RefObject<HTMLInputElement>;
  mobileInputRef: RefObject<HTMLInputElement>;
  desktopSearchWrapRef: RefObject<HTMLDivElement>;
  mobileSearchWrapRef: RefObject<HTMLDivElement>;
  homeDesktopRowRef: RefObject<HTMLDivElement>;
  homeDesktopNavRef: RefObject<HTMLDivElement>;
  homeDesktopIconsRef: RefObject<HTMLDivElement>;
  setIsMobileSearchOpen: (next: boolean) => void;
  setActiveSuggestionIndex: (index: number) => void;
  handleMobileSearchToggle: () => void;
  handleSearchSubmit: (e: FormEvent) => void;
  handleSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  expandDesktopSearch: () => void;
  collapseDesktopSearch: () => void;
  navigateToSuggestion: (item: LiveSearchResult) => void;
  navigateToEvent: (item: EventSearchResult) => void;
  navigateToSpecial: (item: SpecialSearchResult) => void;
  handleSelectQuerySuggestion: (suggestion: QuerySuggestion) => void;
  handleViewAll: () => void;
}

export function useHeaderSearchController({
  pathname,
  isHomePage,
  isPersonalLayout,
  isGuest,
}: UseHeaderSearchControllerOptions): HeaderSearchController {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSelfUrlUpdateRef = useRef(false);
  const desktopSearchWrapRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapRef = useRef<HTMLDivElement>(null);
  const homeDesktopRowRef = useRef<HTMLDivElement>(null);
  const homeDesktopNavRef = useRef<HTMLDivElement>(null);
  const homeDesktopIconsRef = useRef<HTMLDivElement>(null);
  const urlSearchQuery = searchParams.get("search") || "";

  const [headerSearchQuery, setHeaderSearchQuery] = useState(urlSearchQuery);
  const [headerPlaceholder, setHeaderPlaceholder] = useState("Search...");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [desktopSearchExpandedWidth, setDesktopSearchExpandedWidth] = useState(280);

  const {
    setQuery: setSuggestionQuery,
    loading: suggestionsLoading,
    results: suggestionResults,
    eventResults: rawEventResults,
    specialResults: rawSpecialResults,
  } = useLiveSearch({ initialQuery: urlSearchQuery, debounceMs: 120 });

  const { suggestions: querySuggestions } = useSearchSuggestions({
    query: headerSearchQuery,
    debounceMs: 200,
  });

  const shouldKeepGuestMode = isGuest || searchParams.get("guest") === "true";

  const buildSearchResultsHref = useCallback(
    (query: string) => {
      const params = new URLSearchParams();
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        params.set("search", trimmedQuery);
      }
      if (shouldKeepGuestMode) {
        params.set("guest", "true");
      }
      const queryString = params.toString();
      return `/home${queryString ? `?${queryString}` : ""}`;
    },
    [shouldKeepGuestMode]
  );

  useEffect(() => {
    if (isSelfUrlUpdateRef.current) return;
    setHeaderSearchQuery(urlSearchQuery);
    if (urlSearchQuery) {
      setIsMobileSearchOpen(true);
    }
  }, [urlSearchQuery]);

  const isSearchActive = headerSearchQuery.trim().length > 0;

  useEffect(() => {
    setSuggestionQuery(headerSearchQuery);
  }, [headerSearchQuery, setSuggestionQuery]);

  const cappedSuggestions = useMemo(() => {
    const list = Array.isArray(suggestionResults) ? suggestionResults : [];
    return list.slice(0, 6);
  }, [suggestionResults]);

  const cappedEventResults = useMemo(() => rawEventResults.slice(0, 3), [rawEventResults]);
  const cappedSpecialResults = useMemo(() => rawSpecialResults.slice(0, 3), [rawSpecialResults]);

  const isSuggestionsOpen =
    headerSearchQuery.trim().length > 0 &&
    (isDesktopSearchExpanded || isMobileSearchOpen) &&
    (suggestionsLoading ||
      cappedSuggestions.length > 0 ||
      querySuggestions.length > 0 ||
      cappedEventResults.length > 0 ||
      cappedSpecialResults.length > 0);

  useEffect(() => {
    const setByViewport = () => {
      setHeaderPlaceholder(window.innerWidth >= 1024 ? "Search businesses..." : "Search...");
    };
    setByViewport();
    window.addEventListener("resize", setByViewport);
    return () => window.removeEventListener("resize", setByViewport);
  }, []);

  useEffect(() => {
    if (!isHomePage || !isPersonalLayout) {
      setDesktopSearchExpandedWidth(280);
      return;
    }

    const minWidth = 180;
    const preferredWidth = 280;
    const interItemGap = 12;
    const centerClearance = 16;

    const recalc = () => {
      if (window.innerWidth < 1024) {
        setDesktopSearchExpandedWidth(preferredWidth);
        return;
      }

      const rowWidth = homeDesktopRowRef.current?.clientWidth ?? 0;
      const navWidth = homeDesktopNavRef.current?.offsetWidth ?? 0;
      const iconsWidth = homeDesktopIconsRef.current?.offsetWidth ?? 0;

      if (!rowWidth || !navWidth) {
        setDesktopSearchExpandedWidth(preferredWidth);
        return;
      }

      const sideSpace = (rowWidth - navWidth) / 2;
      const availableForSearch = Math.max(
        0,
        Math.floor(sideSpace - iconsWidth - interItemGap - centerClearance)
      );

      const targetWidth =
        availableForSearch < minWidth
          ? Math.min(preferredWidth, Math.max(minWidth, Math.floor(sideSpace - centerClearance)))
          : Math.min(preferredWidth, availableForSearch);

      setDesktopSearchExpandedWidth(Number.isFinite(targetWidth) ? targetWidth : preferredWidth);
    };

    recalc();

    const observer = new ResizeObserver(recalc);
    if (homeDesktopRowRef.current) observer.observe(homeDesktopRowRef.current);
    if (homeDesktopNavRef.current) observer.observe(homeDesktopNavRef.current);
    if (homeDesktopIconsRef.current) observer.observe(homeDesktopIconsRef.current);
    window.addEventListener("resize", recalc);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [isHomePage, isPersonalLayout]);

  const updateSearchUrl = useCallback(
    (query: string) => {
      if (!isHomePage) return;

      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }
      const searchString = params.toString();
      const basePath = pathname === "/home" ? "/home" : "/";
      router.replace(`${basePath}${searchString ? `?${searchString}` : ""}`, { scroll: false });
    },
    [isHomePage, pathname, router]
  );

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeaderSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      isSelfUrlUpdateRef.current = true;
      updateSearchUrl(value);
      setTimeout(() => {
        isSelfUrlUpdateRef.current = false;
      }, 100);
    }, 300);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isHomePage) {
      updateSearchUrl(headerSearchQuery);
    } else {
      router.push(buildSearchResultsHref(headerSearchQuery));
    }
  };

  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setHeaderSearchQuery("");
    if (isHomePage) {
      updateSearchUrl("");
    }
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  };

  const collapseDesktopSearch = useCallback(() => {
    setIsDesktopSearchExpanded(false);
    setActiveSuggestionIndex(-1);
  }, []);

  const expandDesktopSearch = useCallback(() => {
    setIsDesktopSearchExpanded(true);
    setActiveSuggestionIndex(-1);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const inDesktop = desktopSearchWrapRef.current?.contains(target);
      const inMobile = mobileSearchWrapRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        collapseDesktopSearch();
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [collapseDesktopSearch]);

  useEffect(() => {
    if (isSuggestionsOpen && isMobileSearchOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isSuggestionsOpen, isMobileSearchOpen]);

  useEffect(() => {
    setIsMobileSearchOpen(false);
    collapseDesktopSearch();
  }, [pathname, collapseDesktopSearch]);

  const navigateToSuggestion = useCallback(
    (item: LiveSearchResult) => {
      if (!item?.id) return;
      collapseDesktopSearch();
      setIsMobileSearchOpen(false);
      setActiveSuggestionIndex(-1);
      router.push(`/business/${item.id}`);
    },
    [collapseDesktopSearch, router]
  );

  const navigateToEvent = useCallback(
    (item: EventSearchResult) => {
      collapseDesktopSearch();
      setIsMobileSearchOpen(false);
      setActiveSuggestionIndex(-1);
      router.push(`/event/${item.id}`);
    },
    [collapseDesktopSearch, router]
  );

  const navigateToSpecial = useCallback(
    (item: SpecialSearchResult) => {
      collapseDesktopSearch();
      setIsMobileSearchOpen(false);
      setActiveSuggestionIndex(-1);
      router.push(`/special/${item.id}`);
    },
    [collapseDesktopSearch, router]
  );

  const handleSelectQuerySuggestion = useCallback(
    (suggestion: QuerySuggestion) => {
      const q = suggestion.query;
      setHeaderSearchQuery(q);
      setSuggestionQuery(q);
      collapseDesktopSearch();
      setIsMobileSearchOpen(false);
      setActiveSuggestionIndex(-1);
      router.push(buildSearchResultsHref(q));
    },
    [buildSearchResultsHref, collapseDesktopSearch, router, setSuggestionQuery]
  );

  const handleViewAll = useCallback(() => {
    const q = headerSearchQuery.trim();
    if (!q) return;

    collapseDesktopSearch();
    setIsMobileSearchOpen(false);
    setActiveSuggestionIndex(-1);
    router.push(buildSearchResultsHref(q));
  }, [buildSearchResultsHref, collapseDesktopSearch, headerSearchQuery, router]);

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen) return;
    const max = cappedSuggestions.length;
    if (e.key === "Escape") {
      e.preventDefault();
      collapseDesktopSearch();
      setIsMobileSearchOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (max === 0) return;
      setActiveSuggestionIndex((prev) => (prev + 1) % max);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (max === 0) return;
      setActiveSuggestionIndex((prev) => (prev - 1 + max) % max);
      return;
    }
    if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      const chosen = cappedSuggestions[activeSuggestionIndex];
      if (chosen) navigateToSuggestion(chosen);
    }
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      window.setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    urlSearchQuery,
    headerSearchQuery,
    headerPlaceholder,
    isMobileSearchOpen,
    isDesktopSearchExpanded,
    activeSuggestionIndex,
    desktopSearchExpandedWidth,
    isSearchActive,
    suggestionsLoading,
    cappedSuggestions,
    querySuggestions,
    cappedEventResults,
    cappedSpecialResults,
    isSuggestionsOpen,
    inputRef,
    mobileInputRef,
    desktopSearchWrapRef,
    mobileSearchWrapRef,
    homeDesktopRowRef,
    homeDesktopNavRef,
    homeDesktopIconsRef,
    setIsMobileSearchOpen,
    setActiveSuggestionIndex,
    handleMobileSearchToggle,
    handleSearchSubmit,
    handleSearchInputChange,
    handleSearchKeyDown,
    handleClearSearch,
    expandDesktopSearch,
    collapseDesktopSearch,
    navigateToSuggestion,
    navigateToEvent,
    navigateToSpecial,
    handleSelectQuerySuggestion,
    handleViewAll,
  };
}
