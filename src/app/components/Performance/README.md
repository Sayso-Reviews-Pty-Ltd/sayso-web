# Performance

Client-side performance optimisation utilities and providers.

## Files

| File                            | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `ClientLayoutWrapper.tsx`       | Client boundary wrapper for the root layout            |
| `ClientPerformanceWrapper.tsx`  | Registers performance monitoring on mount              |
| `LazyAnimations.tsx`            | Lazy-loads animation features                          |
| `LinkPrefetch.tsx`              | Prefetches critical routes on idle                     |
| `LoadingOptimizer.tsx`          | Schedules non-critical work with `requestIdleCallback` |
| `OptimizedIcons.tsx`            | Lazy icon loading wrapper                              |
| `OptimizedImage.tsx`            | Image performance helper                               |
| `OptimizedLink.tsx`             | Prefetch-aware link wrapper                            |
| `PerformanceMonitor.tsx`        | Web Vitals monitoring                                  |
| `PerformanceProvider.tsx`       | Context provider for performance flags                 |
| `ResourcePreloader.tsx`         | Preloads fonts and critical assets                     |
| `ServiceWorkerRegistration.tsx` | Registers the app service worker                       |
| `WebVitals.tsx`                 | Sends Core Web Vitals to analytics                     |

## Used By

Root layout.
