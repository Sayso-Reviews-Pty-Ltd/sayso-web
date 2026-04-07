# ProfileHeader

User avatar, display name, username, and optional top-reviewer badge.

## Files

| File                | Purpose          |
| ------------------- | ---------------- |
| `ProfileHeader.tsx` | Main export      |
| `index.ts`          | Barrel re-export |

## Props

| Prop                   | Type             | Default                                  | Description                        |
| ---------------------- | ---------------- | ---------------------------------------- | ---------------------------------- |
| `username`             | `string`         | required                                 | `@username` handle                 |
| `displayName`          | `string`         | —                                        | Full display name                  |
| `avatarUrl`            | `string \| null` | —                                        | Avatar image URL                   |
| `isTopReviewer`        | `boolean`        | `false`                                  | Shows top-reviewer badge           |
| `topReviewerBadgeText` | `string`         | `"Top Reviewer in Cape Town this Month"` | Badge label                        |
| `onEditClick`          | `() => void`     | —                                        | Shows edit icon button if provided |
| `className`            | `string`         | —                                        | Additional Tailwind classes        |

## Used By

User profile page, reviewer profile page.
