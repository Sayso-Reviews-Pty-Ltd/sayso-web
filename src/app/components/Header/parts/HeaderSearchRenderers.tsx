"use client";

import type { CSSProperties, ReactNode } from "react";
import { DesktopHeaderSearch, MobileHeaderSearch } from "../HeaderSearch";
import type { HeaderSearchController } from "../hooks/useHeaderSearchController";

export function renderHeaderDesktopSearchInput(
  searchController: HeaderSearchController,
  sf: CSSProperties,
  expandedWidth: number = 280
): ReactNode {
  return (
    <DesktopHeaderSearch
      wrapperRef={searchController.desktopSearchWrapRef}
      inputRef={searchController.inputRef}
      expandedWidth={expandedWidth}
      isExpanded={searchController.isDesktopSearchExpanded}
      headerSearchQuery={searchController.headerSearchQuery}
      headerPlaceholder={searchController.headerPlaceholder}
      isSearchActive={searchController.isSearchActive}
      isSuggestionsOpen={searchController.isSuggestionsOpen}
      suggestionsLoading={searchController.suggestionsLoading}
      cappedSuggestions={searchController.cappedSuggestions}
      querySuggestions={searchController.querySuggestions}
      eventResults={searchController.cappedEventResults}
      specialResults={searchController.cappedSpecialResults}
      activeSuggestionIndex={searchController.activeSuggestionIndex}
      sf={sf}
      onSubmit={searchController.handleSearchSubmit}
      onChange={searchController.handleSearchInputChange}
      onKeyDown={searchController.handleSearchKeyDown}
      onExpand={searchController.expandDesktopSearch}
      onCollapse={searchController.collapseDesktopSearch}
      onClearSearch={searchController.handleClearSearch}
      onSetActiveSuggestionIndex={searchController.setActiveSuggestionIndex}
      onNavigateToSuggestion={searchController.navigateToSuggestion}
      onSelectQuerySuggestion={searchController.handleSelectQuerySuggestion}
      onNavigateToEvent={searchController.navigateToEvent}
      onNavigateToSpecial={searchController.navigateToSpecial}
      onViewAll={searchController.handleViewAll}
    />
  );
}

export function renderHeaderMobileSearchInput(
  searchController: HeaderSearchController,
  sf: CSSProperties
): ReactNode {
  return (
    <MobileHeaderSearch
      wrapperRef={searchController.mobileSearchWrapRef}
      inputRef={searchController.mobileInputRef}
      headerSearchQuery={searchController.headerSearchQuery}
      isSearchActive={searchController.isSearchActive}
      isSuggestionsOpen={searchController.isSuggestionsOpen}
      suggestionsLoading={searchController.suggestionsLoading}
      cappedSuggestions={searchController.cappedSuggestions}
      querySuggestions={searchController.querySuggestions}
      eventResults={searchController.cappedEventResults}
      specialResults={searchController.cappedSpecialResults}
      activeSuggestionIndex={searchController.activeSuggestionIndex}
      sf={sf}
      onSubmit={searchController.handleSearchSubmit}
      onChange={searchController.handleSearchInputChange}
      onKeyDown={searchController.handleSearchKeyDown}
      onClose={() => searchController.setIsMobileSearchOpen(false)}
      onClearSearch={searchController.handleClearSearch}
      onSetActiveSuggestionIndex={searchController.setActiveSuggestionIndex}
      onNavigateToSuggestion={searchController.navigateToSuggestion}
      onSelectQuerySuggestion={searchController.handleSelectQuerySuggestion}
      onNavigateToEvent={searchController.navigateToEvent}
      onNavigateToSpecial={searchController.navigateToSpecial}
      onViewAll={searchController.handleViewAll}
    />
  );
}
