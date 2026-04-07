# Input

Styled text input with label, validation state, helper text, and left/right icon slots.

## Files

| File        | Purpose                            |
| ----------- | ---------------------------------- |
| `Input.tsx` | Main export — wraps shadcn `Input` |
| `index.ts`  | Barrel re-export                   |

## Props

| Prop         | Type                                | Default     | Description                             |
| ------------ | ----------------------------------- | ----------- | --------------------------------------- |
| `variant`    | `"default" \| "error" \| "success"` | `"default"` | Border/ring colour state                |
| `inputSize`  | `"sm" \| "md" \| "lg"`              | `"md"`      | Padding and min-height                  |
| `label`      | `string`                            | —           | Label rendered above the input          |
| `error`      | `string`                            | —           | Error message shown below               |
| `helperText` | `string`                            | —           | Helper text shown below (when no error) |
| `leftIcon`   | `React.ReactNode`                   | —           | Icon inside the left edge               |
| `rightIcon`  | `React.ReactNode`                   | —           | Icon inside the right edge              |
| `fullWidth`  | `boolean`                           | `false`     | Stretches to container width            |

All native `HTMLInputElement` attributes are forwarded.

## Used By

Auth forms (login, register), search bars, profile edit forms.
