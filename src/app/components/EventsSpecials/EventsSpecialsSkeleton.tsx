"use client";

import EventCardSkeleton from "../EventCard/EventCardSkeleton";
import ScrollableSection from "../ScrollableSection/ScrollableSection";

interface EventsSpecialsSkeletonProps {
  title: string;
  containerClass: string;
  showHeaderCta: boolean;
  enableMobilePeek: boolean;
}

export default function EventsSpecialsSkeleton({
  title,
  containerClass,
  showHeaderCta,
  enableMobilePeek,
}: EventsSpecialsSkeletonProps) {
  return (
    <section
      className="relative m-0 w-full"
      aria-label={title}
      style={{
        fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      <div className={containerClass}>
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          <div className="h-8 sm:h-10 w-48 sm:w-64 bg-charcoal/10 rounded-lg animate-pulse px-3 sm:px-4 py-1" />
          {showHeaderCta && (
            <div className="inline-flex items-center gap-1 px-4 py-2 -mx-2">
              <div className="h-4 w-16 bg-charcoal/10 rounded-full animate-pulse" />
              <div className="h-4 w-4 bg-charcoal/10 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        <div className="pt-2">
          <ScrollableSection
            showArrows={false}
            className="items-stretch py-2"
            enableMobilePeek={enableMobilePeek}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="snap-start snap-always flex-shrink-0 w-[100vw] sm:w-auto min-w-[clamp(220px,18vw,320px)] list-none flex justify-center"
              >
                <EventCardSkeleton />
              </div>
            ))}
          </ScrollableSection>
        </div>
      </div>
    </section>
  );
}
