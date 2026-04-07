# BusinessClaim

Multi-step business claim flow: verification form, phone OTP, and claim modal.

## Files

| File                   | Description                              |
| ---------------------- | ---------------------------------------- |
| `ClaimModal.tsx`       | Modal entry point for initiating a claim |
| `PhoneOtpModal.tsx`    | Phone OTP verification step              |
| `VerificationForm.tsx` | Document upload and verification form    |
| `hooks/`               | Local claim flow hooks                   |
| `parts/`               | Sub-components for form steps            |

## Used By

`/business/claim`, `/(business-portal)/claim-business/[businessId]`.
