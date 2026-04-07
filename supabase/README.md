# supabase

Purpose: Database schema, migrations, and edge functions.

Layout

- `migrations/` — 219 ordered SQL files. Treat as immutable; add new migrations rather than editing existing ones.
- `functions/` — Supabase Edge Functions (keep aligned with db schema and env vars).

Working notes

- Run locally with `npx supabase start` then `npx supabase db reset` (or `db push` against remote).
- Ensure RLS policies accompany new tables before exposing routes.
- Keep `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secure (never ship to client).

Owner: TODO.
