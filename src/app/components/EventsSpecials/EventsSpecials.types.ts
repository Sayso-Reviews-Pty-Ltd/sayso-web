import type { Event } from "../../lib/types/Event";

export type ListingTypeFilter = "event" | "special" | null;

export interface EventsSpecialsProps {
  title?: string;
  events: Event[];
  cta?: string;
  href?: string;
  loading?: boolean;
  /** Override section title font-weight (default 700). */
  titleFontWeight?: number;
  /** Override CTA link font-weight (default 600). */
  ctaFontWeight?: number;
  /** Enable premium micro-hover animation on the CTA (default false). */
  premiumCtaHover?: boolean;
  /** Disable scroll-triggered animations (default false). */
  disableAnimations?: boolean;
  /** Hide carousel arrows on desktop (lg+) breakpoints (default false). */
  hideCarouselArrowsOnDesktop?: boolean;
  /** Render the rail edge-to-edge without max-width constraints (default false). */
  fullBleed?: boolean;
  /** Enable home-like mobile hint indicators for horizontal overflow (default false). */
  enableMobilePeek?: boolean;
  /** Show the top-right CTA link in the section header (default true). */
  showHeaderCta?: boolean;
  /** Render title with one-time typed effect (no entrance motion on heading). */
  useTypedTitle?: boolean;
  /** Show Events/Specials pills (notifications styling) for local filtering. */
  showTypeFilters?: boolean;
  /** Include explicit "All" pill in type filters. */
  showAllTypeFilter?: boolean;
  /** Override date ribbon position on cards rendered by this section. */
  dateRibbonPosition?: "corner" | "middle";
  /** Remove title left padding so it aligns with the filter row. */
  alignTitleWithFilters?: boolean;
}
