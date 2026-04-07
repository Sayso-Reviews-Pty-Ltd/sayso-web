# Tabs

Tab navigation bar built on Radix UI Tabs.

## Files

| File       | Purpose          |
| ---------- | ---------------- |
| `Tabs.tsx` | Main export      |
| `index.ts` | Barrel re-export |

## Props

| Prop          | Type                              | Default | Description                                       |
| ------------- | --------------------------------- | ------- | ------------------------------------------------- |
| `tabs`        | `{ id: string; label: string }[]` | —       | Tab definitions                                   |
| `activeTab`   | `string`                          | —       | ID of the currently selected tab                  |
| `onTabChange` | `(tabId: string) => void`         | —       | Called when the user selects a tab                |
| `className`   | `string`                          | —       | Additional Tailwind classes applied to `TabsList` |

## Used By

`BusinessDetailPage`, `ReviewerProfilePage`, `UserProfilePage`.
