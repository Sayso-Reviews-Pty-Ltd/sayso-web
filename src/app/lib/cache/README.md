# lib/cache

In-memory TTL query cache for server-side route handlers.

## Contents

| File            | Key Exports                                 | Description                                                               |
| --------------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| `queryCache.ts` | `getCached`, `setCached`, `invalidateCache` | Simple Map-based cache with per-entry TTL expiry; keyed by request params |

## Notes

- Cache lives in Node.js process memory — resets on cold start (Vercel serverless functions)
- TTL windows per content type are defined in `lib/cachePolicy.ts`
- Not suitable for user-specific or session-sensitive data

## Used By

`api/featured/`, `api/trending/`, `api/curated/`, and other read-heavy public endpoints.
