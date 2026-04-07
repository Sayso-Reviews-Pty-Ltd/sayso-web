# Button

Primary interactive button with loading state, icon slots, and multiple variants.

## Files

| File         | Purpose                             |
| ------------ | ----------------------------------- |
| `Button.tsx` | Main export — wraps shadcn `Button` |
| `index.ts`   | Barrel re-export                    |

## Props

| Prop        | Type                                                                     | Default     | Description                             |
| ----------- | ------------------------------------------------------------------------ | ----------- | --------------------------------------- |
| `variant`   | `"primary" \| "secondary" \| "outline" \| "ghost" \| "danger" \| "bare"` | `"primary"` | Visual style                            |
| `size`      | `"sm" \| "md" \| "lg"`                                                   | `"md"`      | Height and font size                    |
| `isLoading` | `boolean`                                                                | `false`     | Shows `Spinner` and disables the button |
| `fullWidth` | `boolean`                                                                | `false`     | Stretches to 100% container width       |
| `leftIcon`  | `React.ReactNode`                                                        | —           | Icon rendered before the label          |
| `rightIcon` | `React.ReactNode`                                                        | —           | Icon rendered after the label           |
| `children`  | `React.ReactNode`                                                        | —           | Button label                            |

All other `HTMLButtonElement` props are forwarded via `React.forwardRef`.

## Used By

Forms, modals, and action CTAs throughout the application.
