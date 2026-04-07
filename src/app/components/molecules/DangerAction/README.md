# DangerAction

Warning row with a title, description, and a danger-styled CTA button.

## Files

| File               | Purpose          |
| ------------------ | ---------------- |
| `DangerAction.tsx` | Main export      |
| `index.ts`         | Barrel re-export |

## Props

| Prop          | Type                       | Default     | Description                                            |
| ------------- | -------------------------- | ----------- | ------------------------------------------------------ |
| `title`       | `string`                   | required    | Action heading                                         |
| `description` | `string`                   | required    | Explanation of the action                              |
| `buttonText`  | `string`                   | required    | Button label                                           |
| `onAction`    | `() => void`               | required    | Called when the button is clicked                      |
| `variant`     | `"primary" \| "secondary"` | `"primary"` | Solid coral (`primary`) or outline coral (`secondary`) |
| `showBorder`  | `boolean`                  | `true`      | Whether to show a bottom border                        |

## Used By

`organisms/DangerZoneSection`.
