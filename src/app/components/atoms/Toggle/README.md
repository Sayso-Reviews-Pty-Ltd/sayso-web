# Toggle

Boolean on/off switch backed by the shadcn `Switch` primitive.

## Files

| File         | Purpose          |
| ------------ | ---------------- |
| `Toggle.tsx` | Main export      |
| `index.ts`   | Barrel re-export |

## Props

| Prop        | Type         | Default | Description                           |
| ----------- | ------------ | ------- | ------------------------------------- |
| `enabled`   | `boolean`    | —       | Current on/off state (controlled)     |
| `onToggle`  | `() => void` | —       | Called when the user flips the switch |
| `disabled`  | `boolean`    | `false` | Prevents interaction                  |
| `size`      | `ToggleSize` | `"md"`  | Switch size                           |
| `className` | `string`     | —       | Additional Tailwind classes           |

## Used By

Notification preference toggles, feature flag settings, filter toggles.
