# SettingsHeader

Fixed top navigation header with a back link for settings sub-pages.

## Files

| File                 | Purpose          |
| -------------------- | ---------------- |
| `SettingsHeader.tsx` | Main export      |
| `index.ts`           | Barrel re-export |

## Props

| Prop       | Type     | Default  | Description                                         |
| ---------- | -------- | -------- | --------------------------------------------------- |
| `title`    | `string` | required | Page title displayed next to the back arrow         |
| `backHref` | `string` | required | Route to navigate to when the back arrow is pressed |

## Used By

All settings sub-pages (profile settings, privacy settings, notification preferences, etc.).
