# LazyMotion

Framer Motion lazy loader that splits animation code from the main bundle.

## Files

| File             | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `LazyMotion.tsx` | Wraps children with Framer Motion `LazyMotion` and `domAnimation` features |

## Notes

Import `m` from `framer-motion` (not `motion`) in child components to benefit from the lazy split.

## Used By

Root layout via `lib/lazy-motion-provider.tsx`.
