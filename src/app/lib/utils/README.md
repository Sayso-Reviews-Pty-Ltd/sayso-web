# lib/utils

Pure utility functions and server-side helpers — no React, no UI.

## Contents

| File                        | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `anonymousClient.ts`        | Supabase client for unauthenticated read-only requests           |
| `anonymousReviews.ts`       | Helpers for anonymous review submission flows                    |
| `asyncQueries.ts`           | Concurrent Supabase query helpers (parallel fetch utilities)     |
| `businessImages.ts`         | Image URL normalisation and placeholder selection for businesses |
| `businessUpdateEvents.ts`   | Emits custom browser events when business data mutates           |
| `categoryToImageMapper.ts`  | Maps business category slugs to representative PNG images        |
| `cdnUtils.ts`               | Transforms raw Supabase Storage URLs to CDN-optimised URLs       |
| `claimVerification.ts`      | Validates claim document completeness and CIPC formats           |
| `contactCompleteness.ts`    | Scores how complete a business's contact info is                 |
| `contentModeration.ts`      | Basic content filter for user-submitted text                     |
| `deleteBusiness.ts`         | Cascading business delete (images, reviews, claims, etc.)        |
| `descriptionText.ts`        | Truncates and cleans business description text                   |
| `feedCaching.ts`            | Client-side TTL cache helpers for feed data                      |
| `flagRateLimiter.ts`        | Per-user rate limiting for review flag submissions               |
| `fsqToBusinessMapper.ts`    | Maps Foursquare venue data to the app's business schema          |
| `generateUsernameServer.ts` | Server-side username generation from display name                |
| `httpCache.ts`              | HTTP cache-control header helpers for API routes                 |
| `imageValidation.ts`        | File type and size validation for image uploads                  |
| `optimizedQueries.ts`       | Reusable parameterised Supabase query builders                   |
| `orphanedImagesCleanup.ts`  | Finds and removes image DB rows not linked to any entity         |
| `osmCategoryToSlug.ts`      | Maps OpenStreetMap categories to app category slugs              |
| `osmToBusinessMapper.ts`    | Maps OSM POI data to the app's business schema                   |
| `pageTitle.ts`              | Generates SEO-friendly page title strings                        |
| `rateLimiter.ts`            | Generic sliding-window rate limiter for API routes               |
| `responseHeaders.ts`        | Shared response header sets for API routes                       |
| `reviewPreview.ts`          | Generates short preview snippets from review text                |
| `sanitize.ts`               | Strips HTML and normalises user-submitted strings                |
| `schemaMarkup.ts`           | Generates Schema.org JSON-LD for businesses                      |
| `searchHelpers.ts`          | Query normalisation and filter building for search               |
| `seoMetadata.ts`            | Builds Next.js `Metadata` objects for page routes                |
| `serverOrigin.ts`           | Returns the canonical server origin URL from env                 |
| `sitelinkSchema.ts`         | Generates sitelinks Schema.org markup                            |
| `storageBucketConfig.ts`    | Supabase Storage bucket name constants                           |
| `storagePathExtraction.ts`  | Parses storage paths from Supabase Storage URLs                  |
| `validation.ts`             | General-purpose input validation (email, phone, URL)             |

## Used By

API routes, services, and server-side page generation.
