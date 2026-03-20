import type { Review, Reviewer, BusinessOfTheMonth } from "../../types/community";

export interface CommunityHighlightsProps {
  title?: string;
  reviews?: Review[]; // Made optional - will fetch from API if not provided
  topReviewers?: Reviewer[]; // Made optional - will fetch from API if not provided
  businessesOfTheMonth?: BusinessOfTheMonth[];
  cta?: string;
  href?: string;
  variant?: "reviews" | "reviewers";
  /** Disable scroll-triggered animations (default false). */
  disableAnimations?: boolean;
  /** Hide carousel arrows on desktop (lg+) breakpoints (default false). */
  hideCarouselArrowsOnDesktop?: boolean;
}

export interface BadgePreview {
  label: string;
  description: string;
  pngPath: string;
  fallbackIcon: string;
}
