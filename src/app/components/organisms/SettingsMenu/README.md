# SettingsMenu

Grouped list of `SettingsMenuItem` rows with an optional section title.

## Files

| File               | Purpose          |
| ------------------ | ---------------- |
| `SettingsMenu.tsx` | Main export      |
| `index.ts`         | Barrel re-export |

## Props

| Prop        | Type                      | Default  | Description                 |
| ----------- | ------------------------- | -------- | --------------------------- |
| `menuItems` | `SettingsMenuItemProps[]` | required | Menu item definitions       |
| `title`     | `string`                  | —        | Optional group heading      |
| `className` | `string`                  | `""`     | Additional Tailwind classes |

## Used By

Profile settings page, business portal settings page.
