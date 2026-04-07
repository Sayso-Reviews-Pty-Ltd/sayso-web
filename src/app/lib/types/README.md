# lib/types

Shared TypeScript interfaces and type aliases for core domain entities.

## Contents

| File          | Key Exports                                                     | Description                                          |
| ------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| `database.ts` | `AuthUser`, `Profile`, `Business`, `Review`, database row types | Low-level types mapping to Supabase table columns    |
| `user.ts`     | `UserProfile`, `UserStats`, `UserPreferences`                   | Enhanced user types with computed/joined fields      |
| `badges.ts`   | `Badge`, `BadgeCategory`, `BadgeDefinition`                     | Badge system types matching `badgeMappings.ts`       |
| `Event.ts`    | `Event`, `EventOccurrence`, `EventsAndSpecials`                 | Event and special entity types                       |
| `curation.ts` | `CuratedCollection`, `CuratedItem`                              | Types for curated homepage and discovery collections |

## Notes

- `database.ts` types are kept close to the Supabase schema; use them in API routes and services
- Higher-level types (`user.ts`, `Event.ts`) are used in hooks and components

## Used By

All hooks, API routes, services, and components that work with domain data.
