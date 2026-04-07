# Text

Polymorphic typography component that maps semantic variants to HTML elements and design tokens.

## Files

| File       | Purpose          |
| ---------- | ---------------- |
| `Text.tsx` | Main export      |
| `index.ts` | Barrel re-export |

## Props

| Prop        | Type                                                                                                           | Default     | Description                 |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------- |
| `variant`   | `"h1"…"h6" \| "body-lg" \| "body" \| "body-sm" \| "caption" \| "label"`                                        | `"body"`    | Typographic scale           |
| `color`     | `"primary" \| "secondary" \| "tertiary" \| "disabled" \| "sage" \| "coral" \| "white" \| "error" \| "success"` | `"primary"` | Text colour token           |
| `align`     | `"left" \| "center" \| "right"`                                                                                | `"left"`    | Text alignment              |
| `className` | `string`                                                                                                       | —           | Additional Tailwind classes |
| `children`  | `React.ReactNode`                                                                                              | —           | Text content                |

The rendered HTML element follows the variant (e.g. `h1`–`h6` render heading tags; body variants render `<p>`).

## Used By

Standard typography primitive used throughout all molecules and organisms.
