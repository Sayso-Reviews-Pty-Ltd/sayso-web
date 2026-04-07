# EventCard

Animated card component for displaying event and special summaries in rails and grids.

## Files

| File                                 | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| `EventCard.tsx`                      | Main export                                    |
| `EventCard.types.ts`                 | _(not present — types inline)_                 |
| `EventCard.utils.ts`                 | Image selection and fallback artwork detection |
| `EventCard.constants.ts`             | `BLUR_DATA_URL` and static config              |
| `EventBadge.tsx`                     | Category/type badge overlay                    |
| `EventBanner.tsx`                    | Date ribbon banner                             |
| `EventCardSkeleton.tsx`              | Loading skeleton                               |
| `EventContent.tsx`                   | Title, date, location content                  |
| `EventIcon.tsx`                      | Event category icon                            |
| `RatingBadge.tsx`                    | Star rating badge overlay                      |
| `hooks/useEventCountdown.ts`         | Countdown timer to event start                 |
| `hooks/useEventImageLoading.ts`      | Image load state management                    |
| `hooks/useEventPrefetch.ts`          | Route prefetch on hover/touch                  |
| `parts/EventCardCountdown.tsx`       | Countdown ribbon sub-component                 |
| `parts/EventCardContent.tsx`         | Title + date + location                        |
| `parts/EventCardFloatingActions.tsx` | Save/share floating buttons                    |
| `parts/EventCardMedia.tsx`           | Image area with Framer Motion layout animation |
| `parts/EventCardRatingBadge.tsx`     | Rating badge sub-component                     |

## Dependencies

- **Contexts:** `SavedItemsContext`, `ToastContext`
- **Hooks:** `useEventRatings`
- **Animation:** Framer Motion `m`

## Used By

Events & specials feed, home page rails, search results.
