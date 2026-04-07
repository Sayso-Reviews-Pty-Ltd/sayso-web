# IconButton

Square button containing a single icon, used for toolbar actions and compact controls.

## Files

| File             | Purpose          |
| ---------------- | ---------------- |
| `IconButton.tsx` | Main export      |
| `index.ts`       | Barrel re-export |

## Props

| Prop        | Type                                        | Default     | Description                         |
| ----------- | ------------------------------------------- | ----------- | ----------------------------------- |
| `icon`      | `React.ComponentType<SVGProps>`             | —           | Icon to render inside the button    |
| `onClick`   | `() => void`                                | —           | Click handler                       |
| `variant`   | `"default" \| "sage" \| "coral" \| "ghost"` | `"default"` | Visual style                        |
| `size`      | `"sm" \| "md" \| "lg"`                      | `"md"`      | Button dimensions (32 / 40 / 48 px) |
| `ariaLabel` | `string`                                    | —           | Accessible label (required)         |
| `className` | `string`                                    | —           | Additional Tailwind classes         |
| `disabled`  | `boolean`                                   | `false`     | Disables interaction                |

## Used By

`BusinessCard` save button, map controls, modal close buttons, review action bar.
