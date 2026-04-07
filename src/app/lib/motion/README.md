# lib/motion

Framer Motion choreography presets for consistent page and element entry animations.

## Contents

| File              | Key Exports                                              | Description                                                |
| ----------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `choreography.ts` | `fadeInUp`, `staggerContainer`, `slideInLeft`, `scaleIn` | Named Framer Motion variant objects for common transitions |

## Notes

- Variants are designed to compose with `m.div` from `framer-motion`'s lazy bundle
- Stagger timing is tuned so lists feel sequential without feeling slow

## Used By

`AnimatedSection`, `CardRail`, `HomeSectionRow`, and other components that animate on entry.
