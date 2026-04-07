# ConfirmationDialog

Accessible alert dialog for destructive or irreversible actions.

## Files

| File                     | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `ConfirmationDialog.tsx` | Main export — wraps Radix UI `AlertDialog` |
| `index.ts`               | Barrel re-export                           |

## Props

| Prop                 | Type                              | Default     | Description                                        |
| -------------------- | --------------------------------- | ----------- | -------------------------------------------------- |
| `isOpen`             | `boolean`                         | required    | Controls dialog visibility                         |
| `onClose`            | `() => void`                      | required    | Called when dialog is dismissed                    |
| `onConfirm`          | `() => void`                      | required    | Called when user confirms                          |
| `title`              | `string`                          | required    | Dialog heading                                     |
| `message`            | `string`                          | required    | Dialog body text                                   |
| `confirmText`        | `string`                          | `"Confirm"` | Confirm button label                               |
| `cancelText`         | `string`                          | `"Cancel"`  | Cancel button label                                |
| `variant`            | `"danger" \| "warning" \| "info"` | `"danger"`  | Colour theme                                       |
| `isLoading`          | `boolean`                         | `false`     | Shows spinner on confirm button                    |
| `requireConfirmText` | `string`                          | —           | If set, user must type this text to enable confirm |
| `error`              | `string \| null`                  | —           | Error message shown inside the dialog              |

## Used By

`DangerZoneSection`, `DeleteBusinessButton`, `ReviewDeleteAction`.
