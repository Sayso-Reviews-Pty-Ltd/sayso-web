# AchievementsList

Titled list of achievement/badge items for user profile pages.

## Files

| File                   | Purpose          |
| ---------------------- | ---------------- |
| `AchievementsList.tsx` | Main export      |
| `index.ts`             | Barrel re-export |

## Props

| Prop           | Type                     | Default               | Description                 |
| -------------- | ------------------------ | --------------------- | --------------------------- |
| `achievements` | `AchievementItemProps[]` | required              | Array of achievement data   |
| `title`        | `string`                 | `"Your Achievements"` | Section heading             |
| `className`    | `string`                 | `""`                  | Additional Tailwind classes |

## Used By

Achievements page, user profile page.
