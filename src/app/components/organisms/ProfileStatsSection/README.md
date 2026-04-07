# ProfileStatsSection

Stats grid section for user profile pages.

## Files

| File                      | Purpose          |
| ------------------------- | ---------------- |
| `ProfileStatsSection.tsx` | Main export      |
| `index.ts`                | Barrel re-export |

## Props

| Prop        | Type          | Default            | Description                                |
| ----------- | ------------- | ------------------ | ------------------------------------------ |
| `stats`     | `Stat[]`      | required           | `{ icon, value, label, iconColor? }` items |
| `title`     | `string`      | `"Stats Overview"` | Section heading                            |
| `columns`   | `2 \| 3 \| 4` | `3`                | Grid column count                          |
| `className` | `string`      | —                  | Additional Tailwind classes                |

## Used By

User profile page, reviewer profile page.
