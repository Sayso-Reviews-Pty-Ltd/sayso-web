# styles

Global CSS files applied at the application level.

## Contents

| File              | Key Exports | Description                                                                                                                      |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `text-safety.css` | —           | Sets global `overflow-wrap`, `word-wrap`, and `text-rendering` defaults; adds RTL/LTR direction support and CJK word-break rules |

## Used By

- Imported in the root layout or global CSS entry point to apply text safety rules across every page.

## Notes

- Applies `overflow-wrap: break-word` universally via the `*` selector to prevent long URLs or unbreakable strings from overflowing containers.
- Includes multilingual support for Arabic (RTL) and CJK scripts (Chinese, Japanese, Korean, Thai).
