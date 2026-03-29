// src/components/SearchInput/SearchInput.tsx
"use client";

import { useState, useEffect, forwardRef, useRef } from "react";
import { Search, Sliders, Map } from "@/app/lib/icons";
import { Button } from "@/app/components/atoms/Button";
import { useSearchSuggestionState } from "./hooks/useSearchSuggestionState";
import SearchInputSuggestions from "./parts/SearchInputSuggestions";

interface SearchInputProps {
  placeholder?: string;
  mobilePlaceholder?: string;
  onSearch?: (query: string) => void;
  onSubmitQuery?: (query: string) => void;
  onFilterClick?: () => void;
  onMapClick?: () => void;
  showMap?: boolean;
  isMapMode?: boolean;
  onFocusOpenFilters?: () => void;
  showFilter?: boolean;
  showSearchIcon?: boolean;
  className?: string;
  variant?: "header" | "page";
  activeFilterCount?: number;

  /** Suggestions dropdown */
  enableSuggestions?: boolean;
  suggestionsMode?: "business" | "custom";
  maxSuggestions?: number;
  customSuggestions?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    href?: string;
    typeLabel?: string;
  }>;
}

const SearchInput = forwardRef<HTMLFormElement, SearchInputProps>(
  (
    {
      placeholder = "Search...",
      mobilePlaceholder = "Search...",
      onSearch,
      onSubmitQuery,
      onFilterClick,
      onMapClick,
      showMap = false,
      isMapMode = false,
      onFocusOpenFilters,
      showFilter = true,
      showSearchIcon = true,
      className = "",
      variant = "header",
      activeFilterCount = 0,
      enableSuggestions = false,
      suggestionsMode = "business",
      maxSuggestions = 6,
      customSuggestions = [],
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [ph, setPh] = useState(placeholder);
    const rootRef = useRef<HTMLFormElement | null>(null);

    const {
      activeIndex,
      setActiveIndex,
      isFocused,
      setIsFocused,
      blurTimeoutRef,
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
    } = useSearchSuggestionState({
      enableSuggestions,
      suggestionsMode,
      maxSuggestions,
      customSuggestions,
      searchQuery,
      setSearchQuery,
      onSearch,
      onSubmitQuery,
    });

    useEffect(() => {
      const setByViewport = () => {
        setPh(window.innerWidth >= 1024 ? placeholder : mobilePlaceholder);
      };
      setByViewport();
      window.addEventListener("resize", setByViewport);
      return () => window.removeEventListener("resize", setByViewport);
    }, [placeholder, mobilePlaceholder]);

    // Close suggestions on outside click
    useEffect(() => {
      if (!enableSuggestions) return;
      const onDown = (e: MouseEvent) => {
        const target = e.target as Node | null;
        if (!target) return;
        if (rootRef.current?.contains(target)) return;
        setIsFocused(false);
        setActiveIndex(-1);
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [enableSuggestions, setIsFocused, setActiveIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
      setActiveIndex(-1);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmitQuery?.(searchQuery);
      setIsFocused(false);
      setActiveIndex(-1);
    };

    const containerClass =
      variant === "header" ? "w-full" : "relative group w-full sm:w-[90%] md:w-[85%] lg:w-[75%]";

    const prPadding =
      showFilter && onFilterClick && showMap && onMapClick
        ? "pr-24"
        : (showFilter && onFilterClick) || (showMap && onMapClick)
          ? "pr-12"
          : showSearchIcon
            ? "pr-10"
            : "pr-0";

    return (
      <form
        onSubmit={handleSubmit}
        className={`${containerClass} font-urbanist ${className}`}
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLFormElement | null>).current = node;
        }}
      >
        <div className="relative">
          {/* Action buttons on the right - Map, Filters */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 z-10">
            {showMap && onMapClick && (
              <Button
                variant="bare"
                type="button"
                onClick={onMapClick}
                className={`flex items-center text-charcoal/60 hover:text-charcoal transition-colors min-h-0 p-0 ${
                  isMapMode ? "text-coral" : ""
                }`}
                aria-label={isMapMode ? "Show list view" : "Show map view"}
              >
                <Map className="w-5 h-5" strokeWidth={2} />
              </Button>
            )}
            {showFilter && onFilterClick && (
              <Button
                variant="bare"
                type="button"
                onClick={onFilterClick}
                className="relative flex items-center text-charcoal/60 hover:text-charcoal transition-colors min-h-0 p-0"
                aria-label="Open filters"
              >
                <Sliders className="w-5 h-5" strokeWidth={2} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-card-bg text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
            {!showFilter && !showMap && showSearchIcon && (
              <div className="flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-charcoal/60" strokeWidth={2} />
              </div>
            )}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocusCapture={onFocusOpenFilters}
            onTouchStart={onFocusOpenFilters}
            onFocus={() => {
              if (blurTimeoutRef.current != null) {
                window.clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              setIsFocused(true);
            }}
            onBlur={() => {
              if (!enableSuggestions) {
                setIsFocused(false);
                return;
              }
              blurTimeoutRef.current = window.setTimeout(() => {
                setIsFocused(false);
                setActiveIndex(-1);
              }, 90);
            }}
            onKeyDown={handleKeyDown}
            placeholder={ph}
            className={`
              w-full bg-transparent border-0 border-b-2 border-charcoal/20
              text-base placeholder:text-base placeholder:text-charcoal/60 font-normal text-charcoal
              focus:outline-none focus:border-charcoal/60
              hover:border-charcoal/30 transition-all duration-200
              ${prPadding}
              py-3 px-0
            `}
            aria-label="Search"
          />

          {enableSuggestions && (
            <div
              className={`
                absolute left-0 right-0 top-[calc(100%+10px)] z-[200]
                rounded-[14px] bg-off-white/95 backdrop-blur-xl overflow-hidden
                shadow-[0_18px_50px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.10)]
                transition-all duration-200 ease-out
                ${
                  isOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                }
              `}
              role="listbox"
              aria-label="Search suggestions"
              onMouseDown={(e) => e.preventDefault()}
            >
              {isOpen && (
                <SearchInputSuggestions
                  suggestionsMode={suggestionsMode}
                  liveLoading={liveLoading}
                  businessSuggestions={businessSuggestions}
                  normalizedCustomSuggestions={normalizedCustomSuggestions}
                  querySuggestions={querySuggestions}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  onSelectQuerySuggestion={onSelectQuerySuggestion}
                  onSelectBusiness={onSelectBusiness}
                  onSelectCustom={onSelectCustom}
                  dismissSuggestions={dismissSuggestions}
                />
              )}
            </div>
          )}
        </div>
      </form>
    );
  }
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
