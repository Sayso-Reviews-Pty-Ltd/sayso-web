# contexts

React Context providers that manage global application state across the Next.js App Router.

## Contents

| File                       | Key Exports                                                                 | Description                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthContext.tsx`          | `AuthProvider`, `useAuth`                                                   | Manages Supabase auth session, user object, login/register/logout actions, and snapshot status; re-exports types and constants for consumers |
| `AuthContext.types.ts`     | `AuthContextType`, `AuthProviderProps`                                      | TypeScript interfaces for the auth context value and provider props                                                                          |
| `AuthContext.constants.ts` | `DEFAULT_AUTH_CONTEXT`, `AUTH_DEBOUNCE_MS`, `LOCALSTORAGE_CLEANUP_DELAY_MS` | Default context value and timing constants used by `AuthContext.tsx`                                                                         |
| `AuthContext.utils.ts`     | `isSchemaCacheError`                                                        | Detects Supabase schema-cache errors related to `onboarding_completed_at`                                                                    |
| `NotificationsContext.tsx` | `NotificationsProvider`, `useNotifications`                                 | Fetches and streams in-app notifications via SWR + Supabase Realtime; fires badge celebration on `badge_earned` events                       |
| `OnboardingContext.tsx`    | `OnboardingProvider`, `useOnboarding`                                       | Tracks multi-step onboarding flow; persists selections to DB with localStorage as temporary UI buffer only                                   |
| `RealtimeContext.tsx`      | `RealtimeProvider`, `useRealtime`                                           | Subscribes to realtime badge events and queues `BadgeNotification` overlays one at a time                                                    |
| `SavedItemsContext.tsx`    | `SavedItemsProvider`, `useSavedItems`                                       | Manages the current user's saved businesses via SWR; exposes add/remove/toggle helpers with optimistic updates                               |
| `ToastContext.tsx`         | `ToastProvider`, `useToast`                                                 | Wraps `sonner` to provide `showToast`, `showToastOnce`, `queueFlashToast`, and `removeToast`; handles cross-route flash toasts               |
| `ToastContext.test.tsx`    | —                                                                           | Unit tests for `ToastContext`                                                                                                                |

## Used By

- `AuthContext` — consumed by nearly every authenticated page and component via `useAuth()`
- `NotificationsContext` — consumed by the notifications bell/panel components
- `OnboardingContext` — consumed by `/onboarding/*` step pages
- `RealtimeContext` — consumed by the root layout to show badge pop-ups globally
- `SavedItemsContext` — consumed by business cards and the saved-items page
- `ToastContext` — consumed app-wide for user feedback messages

## Notes

- `AuthContext` is split across four co-located files (`AuthContext.tsx`, `.types.ts`, `.constants.ts`, `.utils.ts`) and a `hooks/` subdirectory to stay under the 300-line file limit.
- `OnboardingContext` uses localStorage only as a temporary UI buffer; `profiles.onboarding_completed_at` in the database is the authoritative source of truth.
- All providers are client components (`"use client"`).
