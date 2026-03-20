'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Event } from '../../../lib/types/Event';

interface EventCardContentProps {
  event: Event;
  displayRating: number | undefined;
  reviews: number;
  hasReviewed: boolean;
  eventDetailHref: string;
  reviewRoute: string;
  detailTypeLabel: string;
  detailCtaLabel: string;
  detailAriaLabel: string;
}

const fontStyle = {
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
};

export function EventCardContent({
  event,
  displayRating,
  reviews,
  hasReviewed,
  eventDetailHref,
  reviewRoute,
  detailTypeLabel,
  detailCtaLabel,
  detailAriaLabel,
}: EventCardContentProps) {
  const router = useRouter();
  const eventTitleLayoutId = `event-title-${event.id}`;

  return (
    <div className="px-4 pt-3 pb-0 bg-gradient-to-b from-card-bg/95 to-card-bg gap-2 rounded-b-[12px]">
      <div className="flex flex-col gap-2">
        <m.h3
          layoutId={eventTitleLayoutId}
          className="text-base sm:text-lg font-bold text-charcoal leading-tight line-clamp-1 transition-colors duration-300 group-hover:text-navbar-bg/90"
          style={{ ...fontStyle, fontWeight: 700, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}
        >
          {event.title}
        </m.h3>

        <div className="w-full">
          <p
            className="text-sm text-charcoal/70 line-clamp-2 leading-snug"
            style={{ ...fontStyle, fontWeight: 400 }}
            title={event.description || undefined}
          >
            {event.description || (event.type === "event" ? "Join us for this exciting event!" : "Don't miss out on this special offer!")}
          </p>
        </div>
      </div>

      {event.occurrencesCount != null && event.occurrencesCount > 1 && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card-bg/10 text-sage text-sm font-medium w-fit"
          style={{ ...fontStyle, fontWeight: 600 }}
        >
          {event.occurrencesCount} dates available
        </span>
      )}

      {event.type === "event" && !event.businessId && !event.isExternalEvent && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium w-fit bg-coral/10 text-coral"
          style={{ ...fontStyle, fontWeight: 600 }}
        >
          Community-hosted event
        </span>
      )}

      {event.availabilityStatus === 'sold_out' && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full bg-coral/15 text-coral text-sm font-semibold w-fit"
          style={{ ...fontStyle, fontWeight: 600 }}
        >
          Sold Out
        </span>
      )}

      {event.availabilityStatus === 'limited' && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 text-sm font-semibold w-fit"
          style={{ ...fontStyle, fontWeight: 600 }}
        >
          Limited Spots
        </span>
      )}

      {/* Review count */}
      <div className="flex flex-col items-center gap-1 mb-0.5 pt-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <div className="inline-flex items-center justify-center gap-1 min-h-[12px]">
          {displayRating !== undefined ? (
            <>
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(eventDetailHref); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(eventDetailHref); } }}
                className="inline-flex items-center justify-center text-body-sm sm:text-base font-bold leading-none text-navbar-bg underline-offset-2 cursor-pointer transition-colors duration-200 hover:text-coral"
                style={{ ...fontStyle, fontWeight: 700 }}
              >
                {reviews}
              </span>
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(eventDetailHref); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(eventDetailHref); } }}
                className="inline-flex items-center justify-center text-sm leading-none text-navbar-bg underline-offset-2 cursor-pointer transition-colors duration-200 hover:text-coral"
                style={{ ...fontStyle, fontWeight: 400 }}
              >
                Reviews
              </span>
            </>
          ) : (
            <span
              role="button"
              tabIndex={hasReviewed ? -1 : 0}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!hasReviewed) router.push(reviewRoute); }}
              onKeyDown={(e) => { if (!hasReviewed && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); router.push(reviewRoute); } }}
              className={`inline-flex items-center justify-center text-sm font-normal underline-offset-2 min-w-[92px] text-center transition-colors duration-200 ${hasReviewed ? 'text-charcoal/70 cursor-not-allowed' : 'text-charcoal cursor-pointer hover:text-coral'}`}
              style={{ ...fontStyle, fontWeight: 400 }}
              aria-disabled={hasReviewed}
              title={hasReviewed ? 'You have already reviewed this event' : 'Be the first to review'}
            >
              {hasReviewed ? 'Already reviewed' : 'Be the first to review'}
            </span>
          )}
        </div>
      </div>

      {/* Desktop details button */}
      <div className="hidden md:flex items-center justify-center pt-2 pb-0.5 px-1">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(eventDetailHref); }}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sage/40 border transition-all duration-200 shadow-md bg-gradient-to-br from-navbar-bg to-navbar-bg/90 text-white border-sage/50 hover:scale-[1.02] active:scale-95 active:translate-y-[1px] transform-gpu touch-manipulation select-none"
          style={{ ...fontStyle, fontWeight: 600 }}
          aria-label={detailAriaLabel}
        >
          {detailCtaLabel}
        </button>
      </div>

      {/* Mobile details button */}
      <div className="md:hidden flex items-center justify-center pt-1.5 pb-1 px-1">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(eventDetailHref); }}
          className="w-full flex items-center justify-center px-4 py-3 rounded-full text-caption sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage/40 border transition-all duration-200 min-h-[48px] shadow-md bg-gradient-to-br from-navbar-bg to-navbar-bg/90 text-white border-sage/50 active:scale-95 active:translate-y-[1px] transform-gpu touch-manipulation select-none"
          style={{ ...fontStyle, fontWeight: 600 }}
          aria-label={detailAriaLabel}
        >
          {detailCtaLabel}
        </button>
      </div>
    </div>
  );
}
