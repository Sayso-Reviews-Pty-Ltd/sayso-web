# NotificationToggleItem

Label + description row with a Toggle switch for a single notification preference.

## Files

| File                         | Purpose          |
| ---------------------------- | ---------------- |
| `NotificationToggleItem.tsx` | Main export      |
| `index.ts`                   | Barrel re-export |

## Props

| Prop          | Type         | Default  | Description                             |
| ------------- | ------------ | -------- | --------------------------------------- |
| `label`       | `string`     | required | Preference name                         |
| `description` | `string`     | required | What triggering this notification means |
| `enabled`     | `boolean`    | required | Current toggle state                    |
| `onToggle`    | `() => void` | required | Called when the switch is flipped       |

## Used By

`organisms/NotificationsSection`, `organisms/NotificationCategory`.
