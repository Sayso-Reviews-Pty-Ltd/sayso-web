/**
 * Single source of truth for rail card dimensions.
 *
 * All home-section carousel cards (BusinessCard, EventCard,
 * BusinessOfTheMonthCard, ReviewerCard) must use these constants so their
 * outer shells are identical — only the content inside differs.
 *
 * Mobile width is intentionally `w-full` so the card fills whatever slot
 * width HOME_SECTION_CARD_BASE_CLASS assigns (currently min(19.5rem, …)).
 */

/** Card container width across all breakpoints. */
export const RAIL_CARD_WIDTH = "w-full sm:w-[260px] md:w-[340px]";

/** Media / image section height across all breakpoints. */
export const RAIL_CARD_MEDIA_HEIGHT = "h-[280px] sm:h-[300px] md:h-[220px]";

/** Border radius applied to the card shell and its media section. */
export const RAIL_CARD_RADIUS = "rounded-[12px]";
