# lib/celebration

Badge award confetti effect with session-level deduplication.

## Contents

| File                  | Key Exports               | Description                                                                                                                      |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `badgeCelebration.ts` | `triggerBadgeCelebration` | Fires a `canvas-confetti` burst when a new badge is awarded; stores the badge ID in `sessionStorage` to prevent duplicate bursts |

## Used By

`NotificationsContext` and the badge award toast component.
