"use client";

import { m } from "framer-motion";
import type { RefObject } from "react";
import { getChoreoItemMotion } from "../../lib/motion/choreography";
import SearchInput from "../../components/SearchInput/SearchInput";
import InlineFilters from "../../components/Home/InlineFilters";
import ActiveFilterBadges from "../../components/FilterActiveBadges/ActiveFilterBadges";
import type { FilterState } from "../../components/FilterModal/FilterModal";

interface ForYouSearchFiltersProps {
  choreoEnabled: boolean;
  onSearchChange: (query: string) => void;
  onSubmitQuery: (query: string) => void;
  isSearchActive: boolean;
  debouncedSearchQuery: string;
  filters: FilterState;
  onDistanceChange: (distance: string) => void;
  onRatingChange: (rating: number) => void;
  onRemoveFilter: (filterType: "minRating" | "distance") => void;
  onUpdateFilter: (filterType: "minRating" | "distance", value: number | string | null) => void;
  onClearAll: () => void;
  searchWrapRef: RefObject<HTMLDivElement>;
}

export function ForYouSearchFilters({
  choreoEnabled,
  onSearchChange,
  onSubmitQuery,
  isSearchActive,
  debouncedSearchQuery,
  filters,
  onDistanceChange,
  onRatingChange,
  onRemoveFilter,
  onUpdateFilter,
  onClearAll,
  searchWrapRef,
}: ForYouSearchFiltersProps) {
  return (
    <>
      <m.div
        ref={searchWrapRef}
        className="relative z-10 py-3 sm:py-4 px-4"
        {...getChoreoItemMotion({ order: 2, intent: "section", enabled: choreoEnabled })}
      >
        <SearchInput
          variant="header"
          placeholder="Discover exceptional local hidden gems..."
          mobilePlaceholder="Search places, coffee, yoga…"
          onSearch={onSearchChange}
          onSubmitQuery={onSubmitQuery}
          showFilter={false}
          enableSuggestions={true}
        />
      </m.div>

      <m.div {...getChoreoItemMotion({ order: 3, intent: "section", enabled: choreoEnabled })}>
        <InlineFilters
          show={isSearchActive && debouncedSearchQuery.trim().length > 0}
          filters={filters}
          onDistanceChange={onDistanceChange}
          onRatingChange={onRatingChange}
        />
      </m.div>

      <m.div {...getChoreoItemMotion({ order: 4, intent: "section", enabled: choreoEnabled })}>
        <ActiveFilterBadges
          filters={filters}
          onRemoveFilter={onRemoveFilter}
          onUpdateFilter={onUpdateFilter}
          onClearAll={onClearAll}
        />
      </m.div>
    </>
  );
}
