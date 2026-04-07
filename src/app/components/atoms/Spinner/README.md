# Spinner

Animated SVG spinner for inline and full-page loading states.

## Files

| File          | Purpose          |
| ------------- | ---------------- |
| `Spinner.tsx` | Main export      |
| `index.ts`    | Barrel re-export |

## Props

| Prop        | Type     | Default | Description                                                      |
| ----------- | -------- | ------- | ---------------------------------------------------------------- |
| `className` | `string` | —       | Tailwind classes to override size or colour (default: `h-5 w-5`) |

The spinner inherits `currentColor`, so it picks up the surrounding text colour automatically.

## Used By

`Button` (when `isLoading` is true), page loading fallbacks, form submission states.
