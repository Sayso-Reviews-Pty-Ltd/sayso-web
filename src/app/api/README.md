# src/app/api

Purpose: Server route handlers (~39 groups) backing the web and cron flows.

Key groups (non-exhaustive)

- `algolia`, `auth`, `business`, `business-images`, `business-ownership`, `cron`, `events`, `featured`, `interests`, `notifications`, `reviews`, `saved`, `search`, `ticketmaster`, `trending`, `user`, `verification`.

Conventions

- Keep handlers server-only; do not import client-only modules.
- Use Supabase server client (`src/app/lib/supabase/server.ts`) for DB/auth.
- Reuse shared validation/sanitisation utilities and rate limiting where applicable.

Security

- Ensure secrets (Algolia admin key, cron secrets) stay server-side.
- Respect RLS; add policies with new tables before exposing routes.

Owner: TODO.
