# lib/xp

XP level-curve utilities that mirror the `xp_required_for_level()` database function.

## Contents

| File        | Key Exports                                           | Description                                                                |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `levels.ts` | `getLevelFromXP`, `getXPForLevel`, `getLevelProgress` | Converts raw XP totals to level number, threshold, and progress percentage |

## Notes

- The level formula must stay in sync with the Supabase `xp_required_for_level` SQL function; update both together

## Used By

`useUserXP`, `XP` component, leaderboard display.
