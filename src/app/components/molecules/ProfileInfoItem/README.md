# ProfileInfoItem

Single label + value row with an optional coloured icon.

## Files

| File                  | Purpose          |
| --------------------- | ---------------- |
| `ProfileInfoItem.tsx` | Main export      |
| `index.ts`            | Barrel re-export |

## Props

| Prop         | Type                             | Default     | Description           |
| ------------ | -------------------------------- | ----------- | --------------------- |
| `label`      | `string`                         | required    | Field name            |
| `value`      | `string`                         | required    | Field value           |
| `icon`       | `React.ComponentType<SVGProps>`  | —           | Optional leading icon |
| `iconColor`  | `"coral" \| "sage" \| "default"` | `"default"` | Icon background tint  |
| `showBorder` | `boolean`                        | `true`      | Bottom divider        |

## Used By

Profile detail sections, business info panels.
