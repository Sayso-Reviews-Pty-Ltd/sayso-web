"use client";

import EventCardSkeleton from "../EventCard/EventCardSkeleton";
import { Skeleton } from "@/app/components/ui/skeleton";
import ScrollableSection from "../ScrollableSection/ScrollableSection";
import CardRail from "../CardRail/CardRail";
import {
  HOME_SECTION_CARD_BASE_CLASS,
  HOME_SECTION_CONTAINER_INSET_CLASS,
  HOME_SECTION_RAIL_CLASS,
} from "../HomeSectionRow/homeSectionLayout";

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
  const skeletonItems = Array.from({ length: 4 }, (_, index) => index);
  const cardClass = `${HOME_SECTION_CARD_BASE_CLASS} event-card-rail-full-width`;

  return (
    <section className="relative m-0 w-full" aria-label={title}>
      <div className={`${containerClass} ${HOME_SECTION_CONTAINER_INSET_CLASS}`}>
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 bg-charcoal/10 rounded-lg py-1" />
          {showHeaderCta && (
            <div className="inline-flex items-center gap-1 px-4 py-2 -mx-2">
              <Skeleton className="h-4 w-16 bg-charcoal/10 rounded-full" />
              <Skeleton className="h-4 w-4 bg-charcoal/10 rounded-full" />
            </div>
          )}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (max-width: 639px) {
            .event-card-rail-full-width > div {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `,
          }}
        />
        <ScrollableSection className={HOME_SECTION_RAIL_CLASS} enableMobilePeek={enableMobilePeek}>
          <CardRail
            items={skeletonItems}
            getKey={(item) => `event-skeleton-${item}`}
            renderCard={() => <EventCardSkeleton />}
            cardClassName={cardClass}
            disableAnimations
            mobileFullBleedClassName="event-card-rail-full-width"
          />
        </ScrollableSection>
      </div>
    </section>
  );
}
