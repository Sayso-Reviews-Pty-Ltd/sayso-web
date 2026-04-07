# lib/services

Domain service classes encapsulating business logic for each core entity.

## Contents

| File                          | Key Exports                | Description                                               |
| ----------------------------- | -------------------------- | --------------------------------------------------------- |
| `businessService.ts`          | `BusinessService`          | CRUD and search operations for businesses                 |
| `businessOwnershipService.ts` | `BusinessOwnershipService` | Claim verification, ownership transfer, access checks     |
| `reviewService.ts`            | `ReviewService`            | Review creation, deletion, helpful votes, flagging        |
| `userService.ts`              | `UserService`              | Profile management, preferences, XP, streaks              |
| `imageUploadService.ts`       | `ImageUploadService`       | Upload images to Supabase Storage with validation         |
| `imageProcessingService.ts`   | `ImageProcessingService`   | Resize, convert, and optimise images before storage       |
| `emailService.ts`             | `EmailService`             | Transactional emails via configured email provider        |
| `smsService.ts`               | `SmsService`               | SMS dispatching for OTP and claim notifications           |
| `phoneOtpFlow.ts`             | `PhoneOtpFlow`             | Orchestrates phone OTP send → verify → complete flow      |
| `phoneOtpMode.ts`             | `getPhoneOtpMode`          | Reads `PHONE_OTP_MODE` env var to toggle real/mock SMS    |
| `eventLifecycle.ts`           | `EventLifecycleService`    | Status transitions and expiry logic for events & specials |
| `personalizationService.ts`   | `PersonalizationService`   | Builds personalized business feeds from user preferences  |
| `ticketmasterService.ts`      | `TicketmasterService`      | Fetches and maps Ticketmaster events to app schema        |
| `overpassService.ts`          | `OverpassService`          | Queries OpenStreetMap Overpass API for local POI data     |

## Notes

- Services are server-only (import Supabase server client, not browser client)
- Heavy logic lives here to keep API route files under 300 lines

## Used By

API routes under `api/`, admin tools, and cron jobs.
