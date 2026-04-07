# StatCard

Centred stat tile displaying an icon, a numeric value, and a descriptive label.

## Files

| File           | Purpose          |
| -------------- | ---------------- |
| `StatCard.tsx` | Main export      |
| `index.ts`     | Barrel re-export |

## Props

| Prop        | Type                            | Default        | Description                             |
| ----------- | ------------------------------- | -------------- | --------------------------------------- |
| `icon`      | `React.ComponentType<SVGProps>` | —              | Icon rendered inside the circular badge |
| `value`     | `string \| number`              | —              | Primary statistic to display            |
| `label`     | `string`                        | —              | Description of the statistic            |
| `iconColor` | `string`                        | `"text-coral"` | Tailwind text-colour class for the icon |
| `className` | `string`                        | `""`           | Additional Tailwind classes             |

## Used By

`UserProfileHeader` stats row, reviewer profile cards.
