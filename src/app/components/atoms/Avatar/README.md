# Avatar

Circular user avatar that shows an image and falls back to derived initials.

## Files

| File         | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `Avatar.tsx` | Main export — image with Radix UI `AvatarFallback` |
| `index.ts`   | Barrel re-export                                   |

## Props

| Prop        | Type                                   | Default | Description                            |
| ----------- | -------------------------------------- | ------- | -------------------------------------- |
| `src`       | `string \| null`                       | —       | Image URL                              |
| `alt`       | `string`                               | —       | Alt text; also used to derive initials |
| `size`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"`  | Controls width/height and font size    |
| `fallback`  | `string`                               | —       | Override text for initials             |
| `className` | `string`                               | —       | Additional Tailwind classes            |

## Used By

`ReviewCard`, `LeaderboardRow`, `UserProfileHeader`, `ConversationListItem`
