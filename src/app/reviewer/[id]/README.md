# src/app/reviewer/[id]

Purpose: Dynamic reviewer profile page (see `page.tsx`).

Notes

- Data: reviewer info, reviews, badges pulled via SWR hooks and API routes under `src/app/api/reviewers` and `reviews`.
- UI: composed from `parts/` and shared components.
- Keep this route server-first; add `"use client"` only where necessary for interactions.

Owner: TODO.
