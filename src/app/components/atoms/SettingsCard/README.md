# SettingsCard

Card container with a gradient icon header, used to group related settings.

## Files

| File               | Purpose          |
| ------------------ | ---------------- |
| `SettingsCard.tsx` | Main export      |
| `index.ts`         | Barrel re-export |

## Props

| Prop        | Type                             | Default     | Description                            |
| ----------- | -------------------------------- | ----------- | -------------------------------------- |
| `icon`      | `React.ComponentType<SVGProps>`  | —           | Icon displayed in the card header      |
| `title`     | `string`                         | —           | Card heading                           |
| `iconColor` | `"coral" \| "sage" \| "default"` | `"default"` | Gradient colour of the icon background |
| `className` | `string`                         | `""`        | Additional Tailwind classes            |
| `children`  | `React.ReactNode`                | —           | Card body content                      |

## Used By

Profile settings page, notification settings, account preferences.
