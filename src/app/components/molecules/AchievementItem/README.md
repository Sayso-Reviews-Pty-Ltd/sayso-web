# AchievementItem

Single badge/achievement row displaying an icon, name, description, and earn date.

## Files

| File                  | Purpose          |
| --------------------- | ---------------- |
| `AchievementItem.tsx` | Main export      |
| `index.ts`            | Barrel re-export |

## Props

| Prop          | Type             | Default  | Description                                                     |
| ------------- | ---------------- | -------- | --------------------------------------------------------------- |
| `name`        | `string`         | required | Badge or achievement name                                       |
| `description` | `string \| null` | —        | Short description                                               |
| `icon`        | `string`         | —        | Icon path; `/badges/` prefix = PNG image, otherwise Lucide icon |
| `earnedAt`    | `string`         | —        | ISO date string shown as "Earned on …"                          |
| `className`   | `string`         | `""`     | Additional Tailwind classes                                     |

## Used By

`organisms/AchievementsList`, achievements page.
