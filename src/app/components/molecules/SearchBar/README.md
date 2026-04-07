# SearchBar

Controlled search input with a search icon and clear button.

## Files

| File            | Purpose          |
| --------------- | ---------------- |
| `SearchBar.tsx` | Main export      |
| `index.ts`      | Barrel re-export |

## Props

| Prop          | Type                      | Default       | Description                 |
| ------------- | ------------------------- | ------------- | --------------------------- |
| `placeholder` | `string`                  | `"Search..."` | Input placeholder text      |
| `value`       | `string`                  | —             | Controlled value            |
| `onChange`    | `(value: string) => void` | —             | Called on every keystroke   |
| `onSearch`    | `(value: string) => void` | —             | Called on Enter key         |
| `onClear`     | `() => void`              | —             | Called when X is clicked    |
| `className`   | `string`                  | —             | Additional Tailwind classes |

Supports both controlled and uncontrolled modes.

## Used By

Admin panels, search pages, filter sidebars.
