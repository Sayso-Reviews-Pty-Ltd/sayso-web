# SettingsMenuItem

Settings list row with an icon, label, optional chevron, and danger variant.

## Files

| File                   | Purpose          |
| ---------------------- | ---------------- |
| `SettingsMenuItem.tsx` | Main export      |
| `index.ts`             | Barrel re-export |

## Props

| Prop          | Type                            | Default     | Description                                 |
| ------------- | ------------------------------- | ----------- | ------------------------------------------- |
| `icon`        | `React.ComponentType<SVGProps>` | required    | Leading icon                                |
| `label`       | `string`                        | required    | Menu item label                             |
| `onClick`     | `() => void`                    | —           | Click handler                               |
| `variant`     | `"default" \| "danger"`         | `"default"` | Normal (coral on hover) or red danger style |
| `showChevron` | `boolean`                       | `true`      | Whether to show a trailing arrow            |
| `className`   | `string`                        | —           | Additional Tailwind classes                 |

## Used By

`organisms/SettingsMenu`.
