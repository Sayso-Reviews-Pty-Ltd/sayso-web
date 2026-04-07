# lib/algolia

Algolia search client factories and index definitions — server-only.

## Contents

| File         | Key Exports                     | Description                                                           |
| ------------ | ------------------------------- | --------------------------------------------------------------------- |
| `client.ts`  | `getAlgoliaClient`              | Returns an initialised `algoliasearch` client using env credentials   |
| `server.ts`  | `getAlgoliaIndex`               | Returns a typed index reference (server-only; uses the Admin API key) |
| `indices.ts` | `ALGOLIA_INDICES`, `AlgoliaHit` | Index name constants and hit type definitions for businesses          |

## Notes

- Never import these files in `"use client"` components — the Admin API key must stay server-side
- Client-side search uses the Search API key via InstantSearch on the frontend

## Used By

`api/algolia/sync/route.ts`, `api/businesses/search/route.ts`, `lib/services/businessService.ts`
