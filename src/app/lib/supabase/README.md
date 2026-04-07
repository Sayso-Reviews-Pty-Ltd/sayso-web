# lib/supabase

Supabase client factories for each execution context.

## Contents

| File          | Key Exports                                    | Description                                                                           |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| `client.ts`   | `getBrowserSupabase`                           | Browser-safe singleton client (uses `createBrowserClient`)                            |
| `server.ts`   | `getServerSupabase`                            | Server/RSC async client with cookie-based session (uses `createServerClient`)         |
| `pool.ts`     | `getPooledSupabase`                            | Pooled Postgres client for high-throughput server routes (uses `DATABASE_URL` direct) |
| `realtime.ts` | `subscribeToChannel`, `unsubscribeFromChannel` | Supabase Realtime channel subscription helpers                                        |

## Notes

- Import `getBrowserSupabase` in `"use client"` files, `getServerSupabase` in Server Components and API routes
- `pool.ts` bypasses the Supabase REST layer and connects via `pg` directly — use only in API routes, never in client components
- Realtime helpers manage channel lifecycle (subscribe/unsubscribe) to prevent duplicate subscriptions

## Used By

All hooks, API routes, services, and Server Components that need database access.
