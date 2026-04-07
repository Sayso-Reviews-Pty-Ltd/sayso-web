# types

Shared TypeScript type definitions used across pages, components, and API routes.

## Contents

| File           | Key Exports                                                                   | Description                                                                                                      |
| -------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `community.ts` | `Reviewer`, `Review`, `BusinessOfTheMonth`                                    | Domain types for reviewers, individual reviews, and the business-of-the-month feature                            |
| `filters.ts`   | `HomeFilters`, `LocationFilter`, `SortOption`, `PriceRange`, `DistanceOption` | Filter and sort types for the home-page business discovery feed                                                  |
| `supabase.ts`  | `Database`, `Json`                                                            | Auto-generated Supabase database schema types (PostgreSQL → TypeScript); used to type `createClient<Database>()` |

## Used By

- `community.ts` — reviewer cards, review feeds, business profile pages
- `filters.ts` — home-page filter panel, SWR hooks that fetch filtered businesses
- `supabase.ts` — `lib/supabase/client.ts`, `lib/supabase/server.ts`, and all API route handlers

## Notes

- `supabase.ts` is generated output; do not edit manually — regenerate with `supabase gen types typescript`.
- `filters.ts` uses South-African Rand price tiers (`"R"` … `"RRRR"`) and distance in kilometres.
