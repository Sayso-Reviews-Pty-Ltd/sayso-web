# BusinessCard

Animated card component for displaying business summaries in rails and grids.

## Files

| File                                  | Description                                            |
| ------------------------------------- | ------------------------------------------------------ |
| `BusinessCard.tsx`                    | Main export — primary business card                    |
| `BusinessCard.types.ts`               | `BusinessCardProps` interface                          |
| `BusinessCard.constants.ts`           | Blur placeholder and static config                     |
| `BusinessOfTheMonthCard.tsx`          | Premium variant for business of the month              |
| `BusinessOfTheMonthCard.constants.ts` | Constants for the premium card variant                 |
| `hooks/`                              | Local hooks (prefetch, image loading, etc.)            |
| `parts/`                              | Sub-components (media, actions, content, rating badge) |

## Dependencies

- **Contexts:** `SavedItemsContext`, `ToastContext`
- **Hooks:** `useBusinessRatings`
- **Animation:** Framer Motion `m`

## Used By

Home page rails, search results, for-you feed, trending sections.
