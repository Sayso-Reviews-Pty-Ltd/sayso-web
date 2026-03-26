// src/components/EventsSpecials/EventsSpecials.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "@/app/lib/icons";
import EventCard from "../EventCard/EventCard";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import FilterPillGroup from "../Filters/FilterPillGroup";
import { useMemo, useState } from "react";
import WavyTypedTitle from "../Animations/WavyTypedTitle";
import type { EventsSpecialsProps, ListingTypeFilter } from "./EventsSpecials.types";
import { getStableEventRailKey } from "./eventsSpecials.utils";
import CardRail from "../CardRail/CardRail";
import EventsSpecialsSkeleton from "./EventsSpecialsSkeleton";
import {
  HomeSectionRow,
  HOME_SECTION_HEADING_CLASS,
} from "../HomeSectionRow/HomeSectionRow";
import {
  HOME_SECTION_CARD_BASE_CLASS,
  HOME_SECTION_RAIL_CLASS,
} from "../HomeSectionRow/homeSectionLayout";

export default function EventsSpecials({
  title = "Events & Specials",
  events,
  cta = "See More",
  href = "/events-specials",
  loading = false,
  titleFontWeight = 700,
  ctaFontWeight = 600,
  premiumCtaHover = false,
  disableAnimations = false,
  hideCarouselArrowsOnDesktop = false,
  fullBleed = false,
  enableMobilePeek = false,
  showHeaderCta = true,
  useTypedTitle = false,
  showTypeFilters = false,
  showAllTypeFilter = false,
  dateRibbonPosition = "corner",
  alignTitleWithFilters: _alignTitleWithFilters = false,
}: EventsSpecialsProps) {
  const router = useRouter();
  const [activeTypeFilter, setActiveTypeFilter] = useState<ListingTypeFilter>(null);

  const containerClass = fullBleed
    ? "w-full relative z-10"
    : "mx-auto w-full max-w-[2000px] relative z-10";

  const displayEvents = useMemo(() => (events || []).slice(0, 12), [events]);

  const typeCounts = useMemo(() => ({
    eventCount: displayEvents.filter((e) => e.type === "event").length,
    specialCount: displayEvents.filter((e) => e.type === "special").length,
  }), [displayEvents]);

  const filteredEvents = useMemo(() => {
    if (!activeTypeFilter) return displayEvents;
    return displayEvents.filter((e) => e.type === activeTypeFilter);
  }, [displayEvents, activeTypeFilter]);

  const hasEvents = displayEvents.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;

  const headingClass = HOME_SECTION_HEADING_CLASS;

  const headingStyle = {
    fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    fontWeight: titleFontWeight,
  } as const;

  if (loading) {
    return (
      <EventsSpecialsSkeleton
        title={title}
        containerClass={containerClass}
        showHeaderCta={showHeaderCta}
        enableMobilePeek={enableMobilePeek}
      />
    );
  }

  const titleSlot = useTypedTitle ? (
    <WavyTypedTitle
      text={title}
      as="h2"
      className={headingClass}
      typingSpeedMs={40}
      startDelayMs={0}
      disableWave={true}
      style={headingStyle}
    />
  ) : undefined;

  const filterSlot = showTypeFilters && hasEvents ? (
    <FilterPillGroup
      options={[
        ...(showAllTypeFilter
          ? [{ value: null as ListingTypeFilter, label: "All", count: displayEvents.length }]
          : []),
        { value: "event" as ListingTypeFilter, label: "Events", count: typeCounts.eventCount },
        { value: "special" as ListingTypeFilter, label: "Specials", count: typeCounts.specialCount },
      ]}
      value={activeTypeFilter}
      onChange={(value) => setActiveTypeFilter((value as ListingTypeFilter) ?? null)}
      ariaLabel="Event type filter"
      size="sm"
      showCounts
    />
  ) : undefined;

  const cardClass = `${HOME_SECTION_CARD_BASE_CLASS} event-card-rail-full-width`;

  return (
    <>
      <HomeSectionRow
        title={title}
        titleSlot={titleSlot}
        titleFontWeight={titleFontWeight}
        headingClassName={headingClass}
        cta={cta}
        ctaFontWeight={ctaFontWeight}
        href={href}
        showHeaderCta={showHeaderCta}
        premiumCtaHover={premiumCtaHover}
        disableAnimations={disableAnimations}
        filterSlot={filterSlot}
        fullBleed={fullBleed}
      >
        {hasEvents ? (
          hasFilteredEvents ? (
            <ScrollableSection
              className={HOME_SECTION_RAIL_CLASS}
              hideArrowsOnDesktop={hideCarouselArrowsOnDesktop}
              enableMobilePeek={enableMobilePeek}
              disablePeekFade
            >
              <CardRail
                items={filteredEvents}
                getKey={(e) => getStableEventRailKey(e)}
                renderCard={(e, i) => (
                  <EventCard event={e} index={i} dateRibbonPosition={dateRibbonPosition} />
                )}
                cardClassName={cardClass}
                disableAnimations={disableAnimations}
                mobileFullBleedClassName="event-card-rail-full-width"
              />
            </ScrollableSection>
          ) : (
            <div className="py-4">
              <div className="bg-off-white border border-charcoal/10 rounded-lg p-6 text-center">
                <p className="text-body text-charcoal/70 mb-2">
                  No {activeTypeFilter === "special" ? "specials" : "events"} available right now
                </p>
                <p className="text-body-sm text-charcoal/70">Switch filters to view the other listings.</p>
              </div>
            </div>
          )
        ) : (
          <div className="py-4">
            <div className="bg-off-white border border-charcoal/10 rounded-lg p-6 text-center">
              <p className="text-body text-charcoal/70 mb-2">Curated events &amp; specials</p>
              <p className="text-body-sm text-charcoal/70">
                Business owners are adding new events and specials. Check back soon.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => router.push(href)}
                  className="mi-tap inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-6 py-3 text-body font-semibold text-white bg-gradient-to-r from-coral to-coral/85 hover:opacity-95 transition-all duration-200 shadow-md w-full sm:w-auto sm:min-w-[200px]"
                  style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
                  aria-label={`See more: ${title}`}
                >
                  <span>See More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </HomeSectionRow>
    </>
  );
}
