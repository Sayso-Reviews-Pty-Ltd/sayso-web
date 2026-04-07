# src/app/event/[id]

Purpose: Dynamic event detail page.

Notes

- Data fetched from Supabase (event records); Ticketmaster/Quicket ingestors are currently disabled — ensure data is seeded or ingested via a new path if re-enabled.
- Use SWR hooks and server routes; avoid embedding secrets in client components.
- Ensure map tokens are loaded via env (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`).

Owner: TODO.
