# ExpandableSection

Collapsible section with an icon, label, and animated disclosure arrow.

## Files

| File                    | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `ExpandableSection.tsx` | Main export — wraps Radix UI `Collapsible` |
| `index.ts`              | Barrel re-export                           |

## Props

| Prop         | Type                            | Default | Description                                   |
| ------------ | ------------------------------- | ------- | --------------------------------------------- |
| `icon`       | `React.ComponentType<SVGProps>` | —       | Icon shown in the header                      |
| `label`      | `string`                        | —       | Section heading text                          |
| `isExpanded` | `boolean`                       | —       | Controlled open/closed state                  |
| `onToggle`   | `() => void`                    | —       | Called when the header is clicked             |
| `children`   | `React.ReactNode`               | —       | Content revealed when expanded                |
| `showBorder` | `boolean`                       | `true`  | Whether to render a border around the section |
| `className`  | `string`                        | `""`    | Additional Tailwind classes                   |

## Used By

Filter panels, settings sections, and FAQ-style content areas.
