# sayso

Hyper-local business discovery and review platform for South Africa. Users find, review, and engage with businesses near them — with personalised "For You" recommendations, real-time notifications, gamified achievements, and community-driven rankings.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Local setup](#local-setup)
4. [Environment variables](#environment-variables)
5. [Project structure](#project-structure)
6. [Architecture](#architecture)
7. [Database](#database)
8. [Testing](#testing)
9. [Scripts](#scripts)
10. [Deployment](#deployment)
11. [Further reading](#further-reading)

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.0.7 |
| UI library | React | 19.2.1 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | ^4.1.13 |
| Animations | Framer Motion | ^12.23.12 |
| Data fetching | SWR | ^2.4.0 |
| Database / Auth | Supabase (PostgreSQL + Auth + Realtime + Storage) | ^2.75.0 |
| Search | Algolia | ^5.49.2 |
| Maps | Mapbox GL | ^3.17.0 |
| Charts | Recharts | ^3.7.0 |
| AI | OpenAI | ^4.104.0 |
| Email | Postmark / Resend | ^4.0.7 / ^6.5.2 |
| Testing | Jest + Playwright | ^29.7.0 / ^1.40.0 |
| Deployment | Vercel | — |

---

## Prerequisites

- **Node 20+** (see `.nvmrc` or `engines` in `package.json`)
- **npm** (the project does not use yarn or pnpm)
- A [Supabase](https://supabase.com) project (PostgreSQL + Auth + Realtime + Storage)
- An [Algolia](https://algolia.com) app (search and indexing)
- A [Mapbox](https://mapbox.com) access token (maps)

---

## Local setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sayso-web
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp env.example .env
```

At minimum you need the variables marked **required** in `env.example`. See the [Environment variables](#environment-variables) section for a full breakdown.

### 3. Apply database migrations

```bash
npx supabase db push
# or, if using a local Supabase instance:
npx supabase start
npx supabase db reset
```

There are 219 migration files in `supabase/migrations/`. Run them in order; `supabase db push` handles this automatically.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses Turbopack for fast reloads.

---

## Environment variables

Copy `env.example` to `.env`. Variables are grouped by concern — see the comments in that file for descriptions. A quick summary:

| Group | Variables | Required? |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL` | Yes |
| App URL | `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL` | Yes |
| Algolia | `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SYNC_SECRET` | Yes |
| Maps | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes |
| System IDs | `SYSTEM_BUSINESS_ID`, `SYSTEM_USER_ID` | Yes |
| Email | `NEXT_POSTMARK_API_KEY`, `FROM_EMAIL`, `FROM_NAME` | Recommended |
| AI | `OPENAI_API_KEY` | Optional |
| Events | `TICKETMASTER_API_KEY`, `QUICKET_API_KEY`, `FOURSQUARE_API_KEY` | Optional |
| SMS / OTP | `AFRICAS_TALKING_API_KEY`, `TWILIO_ACCOUNT_SID`, `OTP_PEPPER` | Optional |
| Push | `PUSH_DISPATCH_SECRET`, `EXPO_ACCESS_TOKEN` | Optional |
| Cron | `CRON_SECRET` | Optional |
| E2E tests | `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_PERSONAL_ACCOUNT_EMAIL`, `E2E_PERSONAL_ACCOUNT_PASSWORD` | For E2E only |

`VERCEL_URL` is injected automatically by Vercel at build time — do not set it manually.

---

## Project structure

```
sayso-web/
├── src/app/
│   ├── (business-portal)/     # Business owner pages (grouped layout)
│   │   ├── add-business/
│   │   ├── add-event/
│   │   ├── add-special/
│   │   ├── claim-business/
│   │   ├── my-businesses/
│   │   └── settings/
│   ├── (dev)/                 # Dev-only pages (design system, test routes)
│   ├── [city-slug]/           # City-scoped discovery pages
│   ├── admin/                 # Admin dashboard (business approval, claims, flags)
│   ├── api/                   # ~39 API route groups (see below)
│   ├── auth/                  # Supabase Auth callback + error pages
│   ├── business/              # Business detail, login, register, claim
│   ├── components/            # All UI components (100+ directories)
│   ├── contexts/              # React context providers (see Architecture)
│   ├── hooks/                 # 60+ custom SWR and utility hooks
│   ├── lib/                   # Core utilities: Supabase clients, SWR config, types, services
│   ├── styles/                # Global CSS
│   └── (user pages)           # home, for-you, explore, search, saved, profile,
│                              #   leaderboard, achievements, events-specials,
│                              #   write-review, notifications, dm, trending-now, legal
│
├── supabase/
│   ├── migrations/            # 219 ordered SQL migration files
│   └── functions/             # Supabase Edge Functions
│
├── __tests__/
│   ├── api/                   # API route tests
│   └── unit/                  # Unit tests
│
├── e2e/                       # Playwright end-to-end tests
├── agents/                    # Claude Code agent definitions
├── docs/                      # Internal documentation (see Further reading)
├── scripts/                   # Seeding, performance, and build scripts
├── services/                  # External service integrations
├── env.example                # All environment variables with descriptions
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
├── jest.config.js
└── playwright.config.ts
```

### API routes (`src/app/api/`)

The API layer is split across ~39 route groups:

`admin` · `algolia` · `auth` · `badges` · `business` · `business-images` · `business-ownership` · `business-stats` · `contact` · `conversations` · `cron` · `curated` · `deal-breakers` · `events` · `event-sources` · `featured` · `geocode` · `images` · `interests` · `internal` · `leaderboard` · `notifications` · `og` · `onboarding` · `reverse-geocode` · `reviewers` · `reviews` · `saved` · `search` · `seed` · `similar-businesses` · `specials` · `subcategories` · `subscribe` · `ticketmaster` · `trending` · `user` · `verification`

---

## Architecture

### Authentication

Supabase Auth handles email/password sign-in and phone OTP. `AuthContext` (`src/app/contexts/AuthContext.tsx`) wraps the entire app and:

- Initialises the session on mount with retry logic (3 retries on mobile, 1 on desktop)
- Maintains three account roles: `user`, `business_owner`, `admin`
- Supports switching between personal and business accounts in the same session
- Syncs auth state across browser tabs via `localStorage` events
- Redirects post-login based on user state: `/verify-email` → `/interests` → `/home` (or `/my-businesses` / `/admin`)

Supabase middleware (`src/middleware.ts`) refreshes the session token on every request.

### Data fetching

All client-side data fetching uses **SWR**. Global defaults live in `src/app/lib/swrConfig.ts`:

```ts
{
  revalidateOnFocus: false,
  dedupingInterval: 5000,
  revalidateOnReconnect: true,
}
```

Prefer `useSWR` and `useSWRInfinite` for all data reads. Use `mutate` with an optimistic update + rollback pattern for writes. Do not introduce `fetch` or `axios` calls directly in components — go through a hook.

### State management

No Redux. State lives in React Context + hooks:

| Context | Responsibility |
|---|---|
| `AuthContext` | Session, user profile, role switching |
| `NotificationsContext` | Real-time notifications, toast queue, mark-read |
| `RealtimeContext` | Supabase Realtime channel coordination |
| `SavedItemsContext` | Saved businesses and events |
| `ToastContext` | Toast dispatch and dismissal |
| `OnboardingContext` | Onboarding step tracking |

### Real-time notifications

```
Supabase INSERT on notifications table
  → postgres_changes subscription (NotificationsContext)
    → toastQueue state
      → NotificationToasts → ToastContainer
```

`NotificationsContext` opens a named Supabase Realtime channel scoped to the authenticated user. If the socket drops, it falls back to SWR polling every 30 seconds. Badge-earned notifications trigger a confetti celebration via `src/app/lib/celebration/`.

### Supabase clients

There are two Supabase client instances — use the right one for the context:

| File | Used in |
|---|---|
| `src/app/lib/supabase/client.ts` | Client components (`"use client"`) |
| `src/app/lib/supabase/server.ts` | Server components, Route Handlers, Server Actions |

Never import `client.ts` from a Server Component or a Route Handler.

### Rendering strategy

- Server Components by default — add `"use client"` only where you need browser APIs, event handlers, or context
- Dynamic imports (`next/dynamic`) for heavy components (maps, charts, modals)
- `Next/Image` everywhere for images; remote domains are whitelisted in `next.config.ts`
- `optimizePackageImports` in `next.config.ts` for large icon/chart libraries

### Search

Algolia powers all business search. The sync webhook (`/api/algolia/sync`) is triggered by Supabase database changes and authenticated via `ALGOLIA_SYNC_SECRET`. Search queries go through `/api/search/` on the server to keep `ALGOLIA_ADMIN_KEY` off the client.

---

## Database

PostgreSQL via Supabase. Key characteristics:

- **219 migration files** in `supabase/migrations/` — always create new migrations, never edit existing ones
- **Row Level Security (RLS)** enabled on all public tables — every new table needs policies
- **Full-text search** on the `businesses` table for fallback search
- **Supabase Storage** for avatars, review photos, and business images

Key tables: `profiles` · `businesses` · `business_images` · `business_ownership` · `reviews` · `events` · `specials` · `notifications` · `badges` · `user_stats` · `conversations` · `messages` · `user_interests`

Custom PostgreSQL functions handle business stats aggregation, recommendation queries, trending calculations, and leaderboard ranking.

See `docs/02_architecture/DATABASE_ARCHITECTURE.md` for the full schema.

---

## Testing

### Unit and integration tests (Jest)

```bash
npm run test:unit          # fast unit tests
npm run test:integration   # integration tests (needs DB env vars)
npm run test:api           # API route tests
npm run test:coverage      # unit tests + coverage report (threshold: 70%)
```

Tests live in `__tests__/unit/` and `__tests__/api/`. Coverage is uploaded to Codecov in CI. Module alias `@/` maps to `src/`, `@test-utils/` maps to `__test-utils__/`.

### End-to-end tests (Playwright)

```bash
npm run test:e2e           # headless, all browsers
npm run test:e2e:ui        # interactive UI mode
npm run test:e2e:debug     # debug mode
```

Playwright tests are in `e2e/`. The config (`playwright.config.ts`) runs across Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari. The dev server starts automatically. Set the `E2E_*` credentials in `.env` before running.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs unit tests, integration tests, E2E tests, `type-check`, and `lint` on every push or PR to `main` or `develop`.

---

## Scripts

```bash
# Development
npm run dev               # start dev server (Turbopack)
npm run dev:fast          # dev server locked to port 3000
npm run dev:clean         # clean build artifacts then start dev server
npm run dev:perf          # dev server with performance monitoring enabled

# Production
npm run build             # production build
npm run build:fast        # development build (faster, no optimisations)
npm run start             # start production server
npm run clean             # remove .next, out, dist

# Code quality
npm run type-check        # TypeScript check without emit
npm run lint              # ESLint
npm run lint:fix          # ESLint with auto-fix

# Testing
npm run test              # all Jest tests
npm run test:watch        # Jest in watch mode
npm run test:unit         # unit tests only
npm run test:integration  # integration tests only
npm run test:api          # API route tests
npm run test:coverage     # coverage report
npm run test:e2e          # Playwright (headless)
npm run test:e2e:ui       # Playwright (interactive)
npm run test:e2e:debug    # Playwright (debug)
npm run test:all          # unit + integration + e2e

# Performance
npm run build:analyze     # bundle size analysis
npm run perf:check        # performance audit
npm run perf:audit        # detailed performance analysis

# Data
npm run seed:fsq          # seed businesses from Foursquare
npm run seed:osm          # seed businesses from OpenStreetMap
npm run fetch-events      # ingest events from Ticketmaster and Quicket
```

---

## Deployment

The project is built for **Vercel**. Steps:

1. Connect the GitHub repo in the Vercel dashboard
2. Set all environment variables from `env.example` in the Vercel project settings (`VERCEL_URL` is injected automatically)
3. Ensure Supabase Realtime is enabled on your project and the `postgres_changes` publication is configured for the `notifications` table
4. Ensure Algolia indices are created and the sync webhook is registered in your Supabase project pointing at `/api/algolia/sync`

Security headers (CSP, X-Frame-Options, referrer policy, XSS protection) and long-term static caching are configured in `next.config.ts`.

See `docs/07_deployment/` for production readiness checklists.

---

## Further reading

The `docs/` directory contains detailed internal documentation:

| Directory | Contents |
|---|---|
| `docs/01_setup/` | Setup guides, storage policies, badge setup |
| `docs/02_architecture/` | Auth flows, DB schema, dual-account architecture, realtime config |
| `docs/03_features/` | Reviews, onboarding, recommendations, messaging, SEO |
| `docs/04_optimization/` | Performance guide, DB optimisation, bundle analysis |
| `docs/05_design/` | Design system, animation guidelines |
| `docs/07_deployment/` | Deployment checklist, production readiness |
| `docs/08_testing/` | Testing strategy and setup |
| `docs/09_troubleshooting/` | Common issues and fixes |
| `docs/10_specs/` | API specifications |
