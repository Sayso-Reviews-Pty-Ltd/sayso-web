# lib/api

Client-side HTTP helpers for making authenticated requests to the app's own API routes.

## Contents

| File                    | Key Exports          | Description                                                                         |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `apiClient.ts`          | `apiClient`          | Fetch wrapper with request deduplication and shared headers                         |
| `authenticatedFetch.ts` | `authenticatedFetch` | Attaches the current Supabase session token to every request; auto-refreshes on 401 |

## Notes

- `authenticatedFetch` is the standard way for client-side hooks to call `/api/*` endpoints
- If the session is expired it calls `getSession()` before retrying — callers do not need to handle token refresh manually

## Used By

All SWR hooks under `app/hooks/` and client-side components that mutate data.
