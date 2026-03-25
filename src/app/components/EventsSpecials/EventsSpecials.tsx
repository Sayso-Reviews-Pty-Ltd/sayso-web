// src/components/EventsSpecials/EventsSpecials.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "@/app/lib/icons";
import EventCard from "../EventCard/EventCard";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import { m } from "framer-motion";
import FilterPillGroup from "../Filters/FilterPillGroup";
import { useMemo, useState } from "react";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import WavyTypedTitle from "../Animations/WavyTypedTitle";
import type { EventsSpecialsProps, ListingTypeFilter } from "./EventsSpecials.types";
import { containerVariants, itemVariants } from "./eventsSpecials.constants";
import { getStableEventRailKey } from "./eventsSpecials.utils";
import EventsSpecialsSkeleton from "./EventsSpecialsSkeleton";
import { HomeSectionRow } from "../HomeSectionRow/HomeSectionRow";

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
  alignTitleWithFilters = false,
}: EventsSpecialsProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [activeTypeFilter, setActiveTypeFilter] = useState<ListingTypeFilter>(null);

  const containerClass = fullBleed
    ? "w-full relative z-10 px-2 sm:px-3"
    : "mx-auto w-full max-w-[2000px] relative z-10 px-2";

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

  const headingClass = `font-urbanist text-xl sm:text-2xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 ${
    alignTitleWithFilters ? "pl-0 pr-3 sm:pr-4 py-1" : "px-3 sm:px-4 py-1"
  } hover:bg-card-bg/5 rounded-lg cursor-default`;

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

  const cardClass = "snap-start snap-always flex-shrink-0 w-[calc(100vw-80px)] sm:w-auto min-w-[clamp(200px,16vw,300px)] list-none flex justify-center h-full";

  const desktopCards = disableAnimations ? (
    <div className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch">
      {filteredEvents.map((event, index) => (
        <div key={getStableEventRailKey(event)} className={cardClass}>
          <EventCard event={event} index={index} dateRibbonPosition={dateRibbonPosition} />
        </div>
      ))}
    </div>
  ) : (
    <m.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch"
    >
      {filteredEvents.map((event, index) => (
        <m.div key={getStableEventRailKey(event)} variants={itemVariants} className={cardClass}>
          <EventCard event={event} index={index} dateRibbonPosition={dateRibbonPosition} />
        </m.div>
      ))}
    </m.div>
  );

  const mobileCards = filteredEvents.map((event, index) => {
    const isFirst = index === 0 && filteredEvents.length > 1;
    const isLast = index === filteredEvents.length - 1 && filteredEvents.length > 1;
    return (
      <div
        key={getStableEventRailKey(event)}
        data-edge-snap={isFirst ? "first" : isLast ? "last" : undefined}
        className={cardClass}
      >
        <EventCard event={event} index={index} dateRibbonPosition={dateRibbonPosition} />
      </div>
    );
  });

  return (
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
          <div className="pt-2">
            <ScrollableSection
              className="items-stretch py-2"
              hideArrowsOnDesktop={hideCarouselArrowsOnDesktop}
              enableMobilePeek={enableMobilePeek}
            >
              {isDesktop ? desktopCards : <>{mobileCards}</>}
            </ScrollableSection>
          </div>
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
  );
}
