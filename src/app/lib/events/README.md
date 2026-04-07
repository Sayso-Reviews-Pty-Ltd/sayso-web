# lib/events

Helpers for event and special lifecycle management, calendar export, and external integrations.

## Contents

| File                     | Key Exports                    | Description                                                         |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------- |
| `createEventSpecial.ts`  | `createEventSpecial`           | Inserts a new event or special into `events_and_specials`           |
| `mapEvent.ts`            | `mapEventToCard`               | Normalises raw DB rows to the `Event` type used by UI components    |
| `generateICS.ts`         | `generateICSFile`              | Generates an `.ics` calendar file string for an event               |
| `cta.ts`                 | `buildCtaUrl`, `trackCtaClick` | Normalises CTA URLs and records click events                        |
| `quicketCategory.ts`     | `mapQuicketCategory`           | Maps Quicket event categories to app category slugs                 |
| `quicketIngestMapper.ts` | `mapQuicketEventToSpecial`     | Transforms Quicket API responses to `events_and_specials` row shape |

## Used By

`api/events/`, `api/events-and-specials/`, `lib/services/eventLifecycle.ts`
