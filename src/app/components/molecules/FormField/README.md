# FormField

Input with a required-aware label and optional description line.

## Files

| File            | Purpose                            |
| --------------- | ---------------------------------- |
| `FormField.tsx` | Main export — extends `InputProps` |
| `index.ts`      | Barrel re-export                   |

## Props

Extends all `InputProps` from `atoms/Input`, plus:

| Prop          | Type      | Default  | Description                            |
| ------------- | --------- | -------- | -------------------------------------- |
| `label`       | `string`  | required | Field label (rendered above the input) |
| `required`    | `boolean` | `false`  | Appends `*` to the label               |
| `description` | `string`  | —        | Helper text rendered below the label   |

## Used By

Add/edit business forms, profile edit forms, onboarding forms.
