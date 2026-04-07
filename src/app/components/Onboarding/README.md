# Onboarding

Shared UI primitives for the multi-step onboarding flow.

## Files

| File                              | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `OnboardingLayout.tsx`            | Full-screen layout shell with progress and back button |
| `OnboardingCard.tsx`              | Framed content card                                    |
| `OnboardingProgressIndicator.tsx` | Step dots/bar progress indicator                       |
| `OnboardingStepHeader.tsx`        | Step title and description                             |
| `OnboardingItemCard.tsx`          | Selectable option card                                 |
| `OnboardingItemGrid.tsx`          | Grid of `OnboardingItemCard` components                |
| `OnboardingActionBar.tsx`         | Fixed bottom Continue/Skip bar                         |
| `OnboardingBackButton.tsx`        | Back navigation button                                 |
| `OnboardingButton.tsx`            | Styled onboarding CTA button                           |
| `OnboardingErrorBanner.tsx`       | Error message banner                                   |
| `OnboardingErrorBoundary.tsx`     | Error boundary for onboarding steps                    |
| `OnboardingSelectionInfo.tsx`     | "X selected" count display                             |
| `index.ts`                        | Barrel re-export                                       |

## Used By

`/onboarding`, `/interests`, `/deal-breakers`, `/subcategories`.
