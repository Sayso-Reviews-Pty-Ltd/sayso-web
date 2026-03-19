# SSR API Parity Checklist

Use this checklist before replacing `Server Component -> /api/* -> Supabase` chains with direct Supabase calls.

## Route-level checks

- Route/feature:
- Existing API route path:
- Candidate server component path:
- Owner:

## Behavior parity

- Input validation parity (required fields, format checks, bounds).
- Auth checks parity (anonymous vs authenticated behavior).
- Authorization parity (ownership, role checks, admin exceptions).
- RLS parity confirmed (table policies cover every code path).
- Rate limiting parity (same limits or explicit replacement).
- Data-shaping parity (same response fields/types/defaults).
- Error mapping parity (status codes and payload structure).
- Side effects parity (events, notifications, cache invalidation, analytics).
- Cache headers parity (`private` for personalized, public only when safe).

## Safety validation

- Unit test coverage for successful path and failure path.
- Regression check for onboarding/profile edge cases.
- 401/403 handling verified with refresh retry flow.
- Cross-user cache isolation verified.

## Decision

- Replace with direct Supabase call: `yes/no`
- If `no`, keep API boundary and document why:
