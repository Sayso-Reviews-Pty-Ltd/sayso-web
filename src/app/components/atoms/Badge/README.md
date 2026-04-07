# Badge

Inline status chip with semantic colour variants and optional dot indicator.

## Files

| File        | Purpose          |
| ----------- | ---------------- |
| `Badge.tsx` | Main export      |
| `index.ts`  | Barrel re-export |

## Props

| Prop        | Type                                                                            | Default     | Description                                   |
| ----------- | ------------------------------------------------------------------------------- | ----------- | --------------------------------------------- |
| `variant`   | `"sage" \| "coral" \| "success" \| "warning" \| "error" \| "info" \| "neutral"` | `"neutral"` | Colour theme                                  |
| `size`      | `"sm" \| "md" \| "lg"`                                                          | `"md"`      | Padding and font size                         |
| `dot`       | `boolean`                                                                       | `false`     | Renders a small coloured dot before the label |
| `className` | `string`                                                                        | —           | Additional Tailwind classes                   |
| `children`  | `React.ReactNode`                                                               | —           | Badge label content                           |

## Used By

`BusinessCard`, `EventCard`, `ReviewCard`, `UserProfileHeader`
