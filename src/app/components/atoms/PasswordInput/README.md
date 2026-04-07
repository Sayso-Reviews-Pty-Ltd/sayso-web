# PasswordInput

Password field with a show/hide toggle button, built on the `Input` atom.

## Files

| File                | Purpose          |
| ------------------- | ---------------- |
| `PasswordInput.tsx` | Main export      |
| `index.ts`          | Barrel re-export |

## Props

| Prop           | Type                      | Default | Description                 |
| -------------- | ------------------------- | ------- | --------------------------- |
| `label`        | `string`                  | —       | Field label                 |
| `value`        | `string`                  | —       | Controlled value            |
| `onChange`     | `(value: string) => void` | —       | Change handler              |
| `showPassword` | `boolean`                 | —       | Controlled visibility state |
| `onToggleShow` | `() => void`              | —       | Toggles `showPassword`      |
| `placeholder`  | `string`                  | —       | Input placeholder           |
| `className`    | `string`                  | `""`    | Additional Tailwind classes |

## Used By

Login form, register form, change-password form.
