# src

Purpose: Front-end application code for the web app (Next.js App Router).

Key areas

- `app/` — routes, layouts, API handlers, and page components.
- `lib/` — shared utilities (Supabase clients, SWR config, services, types).
- `components/` — shared UI building blocks.
- `contexts/` and `hooks/` — state and data access layers.

Notes

- Keep client/server boundaries clear (`"use client"` only when needed).
- Follow SWR-based data access; avoid ad-hoc fetches in components.
- Migrations and backend logic live in `supabase/`.

Owner: TODO (add team/DRI).
