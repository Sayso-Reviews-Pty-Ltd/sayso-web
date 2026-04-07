# DangerZoneSection

Deactivate and delete account CTA section for the danger zone in profile settings.

## Files

| File                    | Purpose          |
| ----------------------- | ---------------- |
| `DangerZoneSection.tsx` | Main export      |
| `index.ts`              | Barrel re-export |

## Props

| Prop              | Type         | Default  | Description                                  |
| ----------------- | ------------ | -------- | -------------------------------------------- |
| `onDeactivate`    | `() => void` | required | Called when user clicks "Deactivate Account" |
| `onDeleteAccount` | `() => void` | required | Called when user clicks "Delete Account"     |

## Used By

Profile settings page.
