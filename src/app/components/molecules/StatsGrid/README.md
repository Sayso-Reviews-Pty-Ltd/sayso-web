# StatsGrid

Responsive grid of `StatCard` tiles for displaying user or business statistics.

## Files

| File            | Purpose          |
| --------------- | ---------------- |
| `StatsGrid.tsx` | Main export      |
| `index.ts`      | Barrel re-export |

## Props

| Prop        | Type          | Default  | Description                                   |
| ----------- | ------------- | -------- | --------------------------------------------- |
| `stats`     | `Stat[]`      | required | Array of `{ icon, value, label, iconColor? }` |
| `columns`   | `2 \| 3 \| 4` | `3`      | Number of grid columns                        |
| `className` | `string`      | `""`     | Additional Tailwind classes                   |

## Used By

`organisms/ProfileStatsSection`, reviewer profile page.
