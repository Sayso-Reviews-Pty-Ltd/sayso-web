# Auth

Authentication UI components — login/register pages, email verification, and auth feedback.

## Files

| File                            | Description                                |
| ------------------------------- | ------------------------------------------ |
| `AuthPage.tsx`                  | Auth page layout shell                     |
| `AuthPageSkeleton.tsx`          | Loading skeleton for auth pages            |
| `AuthPageView.tsx`              | Rendered auth form view                    |
| `AuthToast.tsx`                 | Toast feedback for auth actions            |
| `EmailVerificationBanner.tsx`   | Top-of-page banner for unverified accounts |
| `EmailVerificationGuard.tsx`    | Wraps routes that require verified email   |
| `EmailVerificationModal.tsx`    | Modal prompting email verification         |
| `EmailVerificationExample.tsx`  | Dev example of the email verification flow |
| `PasswordStrengthIndicator.tsx` | Visual password strength meter             |
| `authFeedback.ts`               | Error message strings for auth states      |
| `Register/`                     | Registration-specific form components      |
| `Shared/`                       | Shared auth UI primitives                  |

## Used By

`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` routes.
