# ReviewsList

Collapsible list of `ReviewItem` cards with an expandable "show all" toggle.

## Files

| File              | Purpose          |
| ----------------- | ---------------- |
| `ReviewsList.tsx` | Main export      |
| `index.ts`        | Barrel re-export |

## Props

| Prop                  | Type                | Default                | Description                                 |
| --------------------- | ------------------- | ---------------------- | ------------------------------------------- |
| `reviews`             | `ReviewItemProps[]` | required               | Array of review data                        |
| `title`               | `string`            | `"Your Contributions"` | Section heading                             |
| `initialDisplayCount` | `number`            | `2`                    | How many reviews to show before "Show more" |
| `showToggle`          | `boolean`           | `true`                 | Whether to show the collapse/expand toggle  |
| `className`           | `string`            | —                      | Additional Tailwind classes                 |

## Used By

User profile page, reviewer profile page.
