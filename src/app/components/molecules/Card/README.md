# Card

Generic card container with multiple visual styles.

## Files

| File       | Purpose          |
| ---------- | ---------------- |
| `Card.tsx` | Main export      |
| `index.ts` | Barrel re-export |

## Props

| Prop        | Type                                              | Default     | Description                         |
| ----------- | ------------------------------------------------- | ----------- | ----------------------------------- |
| `variant`   | `"default" \| "glass" \| "premium" \| "bordered"` | `"default"` | Background and shadow style         |
| `padding`   | `"none" \| "sm" \| "md" \| "lg"`                  | `"md"`      | Internal padding                    |
| `hoverable` | `boolean`                                         | `false`     | Adds hover shadow elevation         |
| `clickable` | `boolean`                                         | `false`     | Adds pointer cursor and press scale |
| `onClick`   | `() => void`                                      | —           | Click handler                       |
| `className` | `string`                                          | —           | Additional Tailwind classes         |
| `children`  | `React.ReactNode`                                 | required    | Card content                        |

## Used By

Settings sections, profile cards, and any block-level content grouping.
