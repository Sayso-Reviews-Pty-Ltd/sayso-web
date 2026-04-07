# lib/onboarding

Helpers for the multi-step onboarding flow (interests → deal-breakers → subcategories → complete).

## Contents

| File                    | Key Exports                                 | Description                                               |
| ----------------------- | ------------------------------------------- | --------------------------------------------------------- |
| `dataManager.ts`        | `loadOnboardingData`, `saveOnboardingStep`  | Fetches and persists onboarding state via the API         |
| `validation.ts`         | `validateInterests`, `validateDealBreakers` | Validates user selections at each onboarding step         |
| `errorHandling.ts`      | `getOnboardingErrorMessage`                 | Maps API errors to user-friendly onboarding error strings |
| `subcategoryMapping.ts` | `mapInterestsToSubcategories`               | Derives recommended subcategories from selected interests |

## Used By

Page-level hooks under `app/hooks/` (`useInterestsPage`, `useDealBreakersPage`, etc.) and `api/onboarding/` routes.
