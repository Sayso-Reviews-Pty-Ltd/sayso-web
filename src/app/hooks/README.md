# Hooks

Custom React hooks for data fetching (SWR), UI utilities, animations, and business/user domain logic.

## Contents

| File                             | Key Exports                          | Description                                                          |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `useBusinesses.ts`               | `useBusinesses`                      | SWR hook to fetch a list of businesses with filter/preference params |
| `useBusinessDetail.ts`           | `useBusinessDetail`                  | SWR hook to fetch a single business by ID or slug                    |
| `useBusinessAccess.ts`           | `useBusinessAccess`                  | Guards access to owner-only pages; redirects if not authorised       |
| `useBusinessAnalytics.ts`        | `useBusinessAnalytics`               | SWR hook for business analytics (views, reviews, rating trend)       |
| `useBusinessDistanceLocation.ts` | `useBusinessDistanceLocation`        | Resolves distance between user and a business                        |
| `useBusinessEvents.ts`           | `useBusinessEvents`                  | SWR hook for events attached to a business                           |
| `useBusinessRatings.ts`          | `useBusinessRatings`                 | SWR hook for a business's ratings breakdown                          |
| `useBusinessReviewPreview.ts`    | `useBusinessReviewPreview`           | SWR hook for the review-preview panel on a business page             |
| `useFeaturedBusinesses.ts`       | `useFeaturedBusinesses`              | SWR hook for featured/promoted businesses                            |
| `useTrendingBusinesses.ts`       | `useTrendingBusinesses`              | SWR hook for trending businesses                                     |
| `useOwnerBusinessDashboard.ts`   | `useOwnerBusinessDashboard`          | SWR hook for owner dashboard summary data                            |
| `useOwnerBusinessesList.ts`      | `useOwnerBusinessesList`             | SWR hook listing all businesses owned by the current user            |
| `useUserBusinessClaims.ts`       | `useUserBusinessClaims`              | SWR hook for pending/approved business claim requests                |
| `useSavedBusinessesDetails.ts`   | `useSavedBusinessesDetails`          | SWR hook for full details of saved businesses                        |
| `useSavedBusinessesFull.ts`      | `useSavedBusinessesFull`             | SWR hook combining saved business IDs with detail data               |
| `useSimpleBusinessSearch.ts`     | `useSimpleBusinessSearch`            | Lightweight keyword search across businesses                         |
| `useUserProfile.ts`              | `useUserProfile`                     | SWR hook for the current user's enhanced profile                     |
| `useUserStats.ts`                | `useUserStats`                       | SWR hook for the current user's aggregate stats                      |
| `useUserBadges.ts`               | `useUserBadges`, `useUserBadgesById` | SWR hooks for earned badges (self or by user ID)                     |
| `useAchievements.ts`             | `useAchievements`                    | SWR hook for full badge/achievement data grouped by category         |
| `useUserStreak.ts`               | `useUserStreak`                      | SWR hook for the current user's review streak                        |
| `useUserXP.ts`                   | `useUserXP`                          | SWR hook for the current user's XP total                             |
| `useNextBadgeProgress.ts`        | `useNextBadgeProgress`               | SWR hook for progress toward the next badge                          |
| `useWeeklyChallenges.ts`         | `useWeeklyChallenges`                | SWR hook for active weekly challenges                                |
| `useLeaderboard.ts`              | `useLeaderboard`                     | SWR hook for reviewer leaderboard with Supabase Realtime updates     |
| `useReviewerProfile.ts`          | `useReviewerProfile`                 | SWR hook for a public reviewer's profile                             |
| `useReviewersTop.ts`             | `useReviewersTop`                    | SWR hook for the top-ranked reviewers list                           |
| `useReviews.ts`                  | `useReviews`                         | SWR hook to submit and manage reviews (create/delete/helpful)        |
| `useReviewForm.ts`               | `useReviewForm`                      | Controlled form state for the review compose flow                    |
| `useUserReviews.ts`              | `useUserReviews`                     | SWR hook for reviews written by the current user                     |
| `useRecentReviews.ts`            | `useRecentReviews`                   | SWR hook for the site-wide recent reviews feed                       |
| `useReviewReplies.ts`            | `useReviewReplies`                   | SWR hook to fetch and post replies to a review                       |
| `useReviewHelpful.ts`            | `useReviewHelpful`                   | SWR hook for toggling helpful votes on a review                      |
| `useReviewTarget.ts`             | `useReviewTarget`                    | Resolves the entity (business or event) being reviewed               |
| `useEventDetail.ts`              | `useEventDetail`                     | SWR hook for a single event or special by ID                         |
| `useEventRatings.ts`             | `useEventRatings`                    | SWR hook for an event's ratings                                      |
| `useEventReviews.ts`             | `useEventReviews`                    | SWR hook for reviews on an event                                     |
| `useEventRsvp.ts`                | `useEventRsvp`                       | SWR hook for RSVP status on an event                                 |
| `useEventReminder.ts`            | `useEventReminder`                   | SWR hook for setting event reminders                                 |
| `useEventsSpecials.ts`           | `useEventsSpecials`                  | SWR hook for the events & specials discovery feed                    |
| `useSavedEvent.ts`               | `useSavedEvent`                      | SWR hook for saved/bookmarked events                                 |
| `useLiveSearch.ts`               | `useLiveSearch`                      | Debounced SWR live search with filter support                        |
| `useSearchSuggestions.ts`        | `useSearchSuggestions`               | Debounced autocomplete suggestions (category/location)               |
| `useUserPreferences.ts`          | `useUserPreferences`                 | SWR hook for the user's stored preferences                           |
| `useInterestsPage.ts`            | `useInterestsPage`                   | Page-level hook for the interests selection screen                   |
| `useSubcategoriesPage.ts`        | `useSubcategoriesPage`               | Page-level hook for subcategory selection                            |
| `useDealbreakerQuickTags.ts`     | `useDealbreakerQuickTags`            | SWR hook for dealbreaker tag options                                 |
| `useDealBreakersPage.ts`         | `useDealBreakersPage`                | Page-level hook for the dealbreakers selection screen                |
| `useCompletePage.ts`             | `useCompletePage`                    | Page-level hook for the onboarding complete screen                   |
| `useRealtime.ts`                 | `useRealtime`                        | Supabase Realtime subscriptions for reviews, votes, badges, stats    |
| `useDebounce.ts`                 | `useDebounce`                        | Generic value debounce utility (default 300 ms)                      |
| `useIsDesktop.ts`                | `useIsDesktop`                       | Returns true when viewport is 768 px+ (md breakpoint)                |
| `usePrefersReducedMotion.ts`     | `usePrefersReducedMotion`            | Reads `prefers-reduced-motion` media query                           |
| `useScrollReveal.ts`             | `useScrollReveal`                    | IntersectionObserver-based scroll reveal; no-op on mobile            |
| `useStaggeredAnimation.ts`       | `useStaggeredAnimation`              | Framer Motion staggered entrance animation variants                  |
| `useAddressBarHide.ts`           | `useAddressBarHide`                  | Sets `--vh` CSS variable to compensate for mobile address bar        |
| `usePageTitle.ts`                | `usePageTitle`                       | Dynamically sets the browser tab title                               |
| `usePrefetchRoutes.ts`           | `usePrefetchRoutes`                  | Prefetches critical routes on mount for instant navigation           |
| `useRoutePrefetch.ts`            | `useRoutePrefetch`                   | Granular route prefetch helper                                       |
| `usePreviousPageBreadcrumb.ts`   | `usePreviousPageBreadcrumb`          | Tracks the previous route for breadcrumb back-links                  |
| `useReverseGeocode.ts`           | `useReverseGeocode`                  | Reverse-geocodes lat/lng to a human-readable location string         |

## Patterns

- SWR keys from `lib/swrKeys.ts`; global config from `lib/swrConfig.ts`
- Authenticated requests use `lib/api/authenticatedFetch`
- Realtime subscriptions live in `lib/supabase/realtime.ts`; hooks subscribe on mount and clean up on unmount
- Animation hooks respect `useIsDesktop` and `usePrefersReducedMotion` to skip motion where appropriate

## Used By

Data-fetching hooks are consumed by page-level route components and feature organisms such as `BusinessCard`, `ReviewsList`, `Leaderboard`, and `UserProfile`.
