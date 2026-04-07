# src/app

Purpose: Next.js App Router surface — pages, layouts, API routes, and grouped feature shells.

Key directories

- `(business-portal)/`, `(dev)/`, `[city-slug]/`, `admin/`, `auth/`, `business/`, `events-specials/`, `home`, `profile`, etc. — user-facing routes.
- `api/` — route handlers (~39 groups) used by the client and cron jobs.
- `components/` — page-level components; keep shared primitives in `src/components` if introduced later.
- `contexts/`, `hooks/`, `lib/`, `styles/`, `types/`, `utils/` — cross-cutting support (see their READMEs).

Conventions

- Prefer Server Components; add `"use client"` only when browser APIs or context are required.
- Data access goes through hooks (SWR) and server routes; avoid direct fetch/axios in components.
- Keep route metadata/SEO in the route file to aid static optimization.

Owner: TODO (add DRI).
