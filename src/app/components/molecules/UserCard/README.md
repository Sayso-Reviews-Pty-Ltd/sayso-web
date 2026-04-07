# UserCard

Compact user card with avatar, name, username, optional bio and badge.

## Files

| File           | Purpose          |
| -------------- | ---------------- |
| `UserCard.tsx` | Main export      |
| `index.ts`     | Barrel re-export |

## Props

| Prop         | Type                                        | Default  | Description                 |
| ------------ | ------------------------------------------- | -------- | --------------------------- |
| `avatarUrl`  | `string \| null`                            | —        | Avatar image URL            |
| `name`       | `string`                                    | required | Display name                |
| `username`   | `string`                                    | —        | `@username` handle          |
| `bio`        | `string`                                    | —        | Short bio line              |
| `badge`      | `{ label: string; variant?: BadgeVariant }` | —        | Optional badge chip         |
| `avatarSize` | `AvatarSize`                                | `"md"`   | Avatar size                 |
| `onClick`    | `() => void`                                | —        | Makes card clickable        |
| `className`  | `string`                                    | —        | Additional Tailwind classes |

## Used By

Leaderboard rows, top reviewers list, DM conversation list.
