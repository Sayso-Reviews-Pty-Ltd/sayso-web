# Skeleton

Loading placeholder that pulses while content is being fetched.

## Files

| File           | Purpose                               |
| -------------- | ------------------------------------- |
| `Skeleton.tsx` | Main export — wraps shadcn `Skeleton` |
| `index.ts`     | Barrel re-export                      |

## Props

| Prop        | Type                                    | Default  | Description                                            |
| ----------- | --------------------------------------- | -------- | ------------------------------------------------------ |
| `variant`   | `"text" \| "circular" \| "rectangular"` | `"text"` | Border-radius preset                                   |
| `size`      | `"sm" \| "md" \| "lg" \| "xl"`          | `"md"`   | Default height/width when no explicit dimensions given |
| `width`     | `string \| number`                      | —        | Override width                                         |
| `height`    | `string \| number`                      | —        | Override height                                        |
| `className` | `string`                                | —        | Additional Tailwind classes                            |

## Used By

`BusinessCardSkeleton`, `ReviewCardSkeleton`, `ProfileSkeleton`, leaderboard placeholders.
