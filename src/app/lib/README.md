# lib

Cross-cutting server and client utilities — the shared foundation for all app logic.

## Top-level Files

| File                       | Key Exports                                             | Description                                                         |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| `auth.ts`                  | `AuthService`                                           | Core authentication service wrapping Supabase Auth                  |
| `authLifecycle.ts`         | `emitAuthLifecycleEvent`, `subscribeAuthLifecycleEvent` | Event bus for auth state transitions                                |
| `authSnapshot.ts`          | `buildClientAuthSnapshot`, `UNKNOWN_AUTH_SNAPSHOT`      | Serialisable auth state snapshot for client hydration               |
| `authValidation.ts`        | validation helpers                                      | Input validators for auth flows                                     |
| `serverAuthSnapshot.ts`    | `buildServerAuthSnapshot`                               | Server-side auth snapshot (RSC-safe)                                |
| `badgeMappings.ts`         | `BADGE_DEFINITIONS`                                     | Complete badge definition catalogue (categories, thresholds, icons) |
| `cachePolicy.ts`           | cache control constants                                 | HTTP cache-control header strings per route type                    |
| `claimNotifications.ts`    | `sendClaimNotification`                                 | Notification dispatcher for claim status changes                    |
| `icons.ts`                 | named icon exports                                      | Centralised Lucide icon re-exports used across the app              |
| `lazy-motion-provider.tsx` | `LazyMotionProvider`                                    | Lazy-loads Framer Motion features to reduce bundle size             |
| `motion.ts`                | motion presets                                          | Framer Motion variant and transition presets                        |
| `notifications.ts`         | `createNotification`                                    | Generic in-app notification creator                                 |
| `supabase.ts`              | `createSupabaseClient`                                  | Legacy Supabase client factory (prefer `lib/supabase/`)             |
| `swrConfig.ts`             | `swrConfig`                                             | Global SWR configuration (revalidation, dedup, error retry)         |
| `swrKeys.ts`               | `swrKeys`                                               | Centralised SWR cache key factory for all data types                |
| `themeUtils.ts`            | `getThemeColor`                                         | Maps design token names to Tailwind colour values                   |
| `topContributor.ts`        | `getTopContributorLabel`                                | Derives top-contributor badge label from XP rank                    |
| `utils.ts`                 | `cn`, misc helpers                                      | `cn` Tailwind class merger and small shared utilities               |
| `admin.ts`                 | `isAdmin`                                               | Checks whether the current session has the admin role               |

## Subdirectories

| Directory      | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `supabase/`    | Supabase client factories for browser, server, pool, and realtime |
| `api/`         | HTTP client helpers with auth and deduplication                   |
| `algolia/`     | Algolia search client factories and index definitions             |
| `services/`    | Domain service classes for business logic                         |
| `types/`       | Shared TypeScript interfaces                                      |
| `utils/`       | Pure utility functions                                            |
| `events/`      | Event/special creation and mapping helpers                        |
| `onboarding/`  | Onboarding flow helpers                                           |
| `motion/`      | Framer Motion choreography presets                                |
| `xp/`          | XP level-curve utilities                                          |
| `cache/`       | In-memory TTL query cache                                         |
| `celebration/` | Badge award confetti helper                                       |
| `mocks/`       | Mock data for development/testing                                 |
| `toast/`       | Cross-route flash toast relay                                     |
