# Icon

Thin wrapper that renders a named Lucide icon at a consistent size and colour.

## Files

| File       | Purpose          |
| ---------- | ---------------- |
| `Icon.tsx` | Main export      |
| `index.ts` | Barrel re-export |

## Props

| Prop        | Type                                                                | Default     | Description                         |
| ----------- | ------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `size`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                              | `"md"`      | Pixel size (12 / 16 / 20 / 24 / 32) |
| `color`     | `"current" \| "sage" \| "coral" \| "charcoal" \| "white" \| "gray"` | `"current"` | Icon colour token                   |
| `className` | `string`                                                            | —           | Additional Tailwind classes         |

## Used By

Used as a prop-type contract alongside inline icon rendering across atoms, molecules, and organisms.
