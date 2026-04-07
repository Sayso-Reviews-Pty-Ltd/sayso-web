# utils

Pure utility functions and one client-side hook used across the application.

## Contents

| File                         | Key Exports                                                                                                                                    | Description                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categoryToPngMapping.ts`    | `getCategoryPlaceholder`, `getCategoryPlaceholderFromLabels`, `isPlaceholderImage`                                                             | Thin backward-compatible wrapper around `subcategoryPlaceholders.ts`; deprecated aliases `getCategoryPng`, `getCategoryPngFromLabels`, `isPngIcon` also exported |
| `subcategoryPlaceholders.ts` | `getSubcategoryPlaceholder`, `getSubcategoryPlaceholderFromCandidates`, `isPlaceholderImage`, `CANONICAL_SUBCATEGORY_SLUGS`, `INTEREST_LABELS` | Canonical 52-slug taxonomy → `/businessImagePlaceholders/*.jpg` mapping; single source of truth for placeholder resolution                                       |
| `businessPrioritization.ts`  | `BusinessWithClassification`, tiering/sorting functions                                                                                        | Three-tier ranking system that surfaces well-classified businesses first; integrates contact-completeness boost                                                  |
| `businessIdMapping.ts`       | `BUSINESS_ID_MAPPING`                                                                                                                          | Static map of legacy numeric IDs to slug-based database IDs for backward compatibility                                                                           |
| `eventIconToPngMapping.ts`   | `getEventIconPng`                                                                                                                              | Maps event icon name strings to `/png/*.png` file paths                                                                                                          |
| `featuredColdStart.ts`       | `selectFeaturedColdStart`, `FeaturedColdStartCandidate`, `FeaturedSelectionOptions`                                                            | Diversity-first featured-feed selection with daily-seed tie-breaking and per-category caps                                                                       |
| `trendingColdStart.ts`       | `selectTrendingColdStart`, `ColdStartCandidate`, `ColdStartSelectionOptions`                                                                   | Diversity-first trending-feed selection with deterministic rotation; max 2 per category default                                                                  |
| `trendingDiversify.ts`       | `diversifyTrendingItems`                                                                                                                       | Generic round-robin diversification by category key; used by both cold-start helpers                                                                             |
| `formatTimeAgo.ts`           | `formatTimeAgo`                                                                                                                                | Formats a timestamp to a human-readable relative string (e.g. "2 minutes") using `dayjs`                                                                         |
| `generateUsername.ts`        | `generateUsernameFromEmail`, `generateUsernameFromUserId`, `getDisplayUsername`                                                                | Derives a display username from email, user ID, or profile fields; matches DB migration logic                                                                    |
| `validation.ts`              | `validateUsername`, `validateEmail`, `validatePassword`, `checkPasswordStrength`                                                               | Form validation helpers; `checkPasswordStrength` returns score, feedback, and colour hint                                                                        |
| `lockBodyScroll.ts`          | `lockBodyScroll`                                                                                                                               | Locks `document.body` scroll and compensates for scrollbar width; returns an unlock cleanup function                                                             |
| `performance.ts`             | `reportWebVitals`, `measureComponentRender`, `preloadResource`                                                                                 | Dev-mode Web Vitals logging, render-time measurement, and `<link rel="preload">` injection                                                                       |
| `useReducedMotion.ts`        | `useReducedMotion`                                                                                                                             | Client hook that returns `true` when the user has `prefers-reduced-motion: reduce` set                                                                           |

## Used By

- Placeholder helpers — business card components, search results, Algolia hit components
- `businessPrioritization.ts` — home-feed and trending API routes
- `formatTimeAgo.ts` — `NotificationsContext`, review timestamps
- `generateUsername.ts` — auth flow, profile display components
- `lockBodyScroll.ts` — modal and drawer components
- `useReducedMotion.ts` — animation components that respect accessibility preferences
- `validation.ts` — registration and profile-edit forms

## Notes

- `categoryToPngMapping.ts` exists only for backward compatibility; prefer `subcategoryPlaceholders.ts` directly.
- `useReducedMotion.ts` is the only hook in this directory; it is co-located here rather than in `hooks/` because it is a standalone accessibility utility with no context dependencies.
