# Performance Optimization Guide for KLIO

## Goal: Achieve <2s load times

## Current Issues Identified

### 1. Bundle Size & Code Splitting

- Multiple context providers loading on every page
- Framer Motion animations adding overhead
- No route-based code splitting for some pages
- Heavy components not lazy-loaded

### 2. Context Re-renders

- Context values recreated on every render
- No memoization of context values
- All 4 contexts (Auth, Onboarding, Toast, SavedItems) wrap every route

### 3. Component Rendering

- No React.memo on expensive components
- Excessive animations on initial load
- Non-optimized image loading

### 4. Network & Caching

- No API response caching
- Images not prioritized for above-the-fold content
- No prefetching for critical routes

---

## Optimizations Implemented

### ✅ Completed

1. **Removed ion-icons** - Replaced with tree-shakeable Lucide React icons
2. **Memoized AuthContext** - Added useMemo to prevent unnecessary re-renders
3. **Fixed TypeScript errors** - Resolved build-blocking issues

### 🚧 In Progress

1. **Context Provider Optimization**
   - Location: `src/app/contexts/AuthContext.tsx`
   - Added: `useMemo` for context value
   - Impact: Prevents re-renders when context value hasn't changed

---

## Recommended Next Steps (Priority Order)

### **Priority 1: Critical Performance Wins**

#### 1.1 Optimize Remaining Context Providers

Apply the same memoization pattern to:

- `src/app/contexts/ToastContext.tsx`
- `src/app/contexts/OnboardingContext.tsx`
- `src/app/contexts/SavedItemsContext.tsx`

```typescript
// Pattern to apply:
const value = useMemo(
  () => ({
    // context values here
  }),
  [
    /* only include values that should trigger re-render */
  ]
);
```

#### 1.2 Add React.memo to Expensive Components

Wrap these components with React.memo:

- `BusinessCard` (in `src/app/components/BusinessRow/BusinessCard.tsx`)
- `BusinessRow` (already memoized in home page, apply globally)
- `ReviewCard` (in `src/app/components/Reviews/ReviewCard.tsx`)
- `Header` (in `src/app/components/Header/Header.tsx`)
- `Footer` (in `src/app/components/Footer/Footer.tsx`)

```typescript
import { memo } from "react";

const BusinessCard = memo(({ business }: BusinessCardProps) => {
  // component code
});

export default BusinessCard;
```

#### 1.3 Implement Lazy Loading for Heavy Components

Already partially done, but ensure all routes use dynamic imports:

```typescript
// In layout or page files:
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // if component doesn't need SSR
});
```

### **Priority 2: Image Optimization**

#### 2.1 Priority Loading

Add `priority` prop to above-the-fold images:

```typescript
<Image
  src={imageUrl}
  alt={alt}
  priority={true}  // For hero images
  loading="lazy"   // For below-the-fold images
/>
```

#### 2.2 Optimize Hero Carousel

- Location: `src/app/components/Hero/HeroCarousel.tsx`
- Preload first slide image
- Lazy load subsequent slides
- Consider reducing animation complexity on initial load

### **Priority 3: Animation Optimization**

#### 3.1 Reduce Initial Animation Overhead

- Disable entrance animations on first page load
- Use CSS animations for simple transitions instead of Framer Motion
- Consider removing scroll-reveal animations (already done in `src/app/home/page.tsx`)

#### 3.2 Optimize Framer Motion Usage

```typescript
// Instead of this:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Consider simpler CSS transitions for initial loads:
<div className="opacity-0 animate-fade-in">
```

### **Priority 4: API & Data Optimization**

#### 4.1 Implement SWR or React Query

Install and configure SWR for data fetching:

```bash
npm install swr
```

```typescript
import useSWR from "swr";

const { data, error } = useSWR("/api/businesses", fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
});
```

#### 4.2 Add Static Data Caching

For data that doesn't change often (categories, interests):

- Use Next.js `generateStaticParams`
- Implement ISR (Incremental Static Regeneration)

### **Priority 5: Bundle Optimization**

#### 5.1 Analyze Bundle Size

Run bundle analyzer:

```bash
npm run build:analyze
```

#### 5.2 Tree-shake Unused Code

- Review and remove unused dependencies
- Use named imports from large libraries
- Split vendor bundles intelligently

#### 5.3 Optimize next.config.ts

Already optimized with:

- ✅ optimizePackageImports for react-icons, framer-motion, lucide-react
- ✅ Code splitting configuration
- ✅ Compression enabled

---

## Performance Measurement

### Tools to Use

1. **Lighthouse** (Chrome DevTools)

   ```
   Target Metrics:
   - FCP (First Contentful Paint): < 1.2s
   - LCP (Largest Contentful Paint): < 2.0s
   - TTI (Time to Interactive): < 2.5s
   - TBT (Total Blocking Time): < 200ms
   ```

2. **Next.js Speed Insights**
   - Already collecting with WebVitals component

3. **Bundle Analyzer**
   ```bash
   ANALYZE=true npm run build
   ```

### Testing Checklist

- [ ] Test on 3G network throttling
- [ ] Test with cache disabled
- [ ] Test on mobile devices
- [ ] Measure FCP, LCP, TTI, TBT
- [ ] Check bundle sizes per route

---

## Quick Wins Summary

| Optimization               | Estimated Impact                | Difficulty |
| -------------------------- | ------------------------------- | ---------- |
| Memoize all contexts       | ~15-20% faster re-renders       | Easy       |
| Add React.memo to cards    | ~20-30% fewer renders           | Easy       |
| Lazy load heavy components | ~30-40% smaller initial bundle  | Medium     |
| Optimize images            | ~25-35% faster LCP              | Easy       |
| Reduce animations          | ~10-15% faster TTI              | Easy       |
| Implement SWR caching      | ~40-50% faster subsequent loads | Medium     |

---

## Implementation Checklist

### Phase 1 (Immediate - Target: -40% load time)

- [x] Remove ion-icons
- [x] Memoize AuthContext
- [ ] Memoize ToastContext
- [ ] Memoize OnboardingContext
- [ ] Memoize SavedItemsContext
- [ ] Add React.memo to BusinessCard
- [ ] Add React.memo to ReviewCard
- [ ] Add priority to hero images

### Phase 2 (This week - Target: -60% load time)

- [ ] Implement SWR for API calls
- [ ] Lazy load all modals
- [ ] Reduce Framer Motion usage
- [ ] Optimize HeroCarousel
- [ ] Bundle size analysis

### Phase 3 (Next week - Target: <2s load time)

- [ ] Implement route prefetching
- [ ] Add service worker for offline support
- [ ] Optimize database queries
- [ ] Implement image CDN
- [ ] Add edge caching

---

## Monitoring & Maintenance

1. **Set up performance budgets** in `next.config.ts`:

```typescript
experimental: {
  performanceBudgets: {
    maxFCPMs: 1200,
    maxLCPMs: 2000,
    maxTTIMs: 2500,
  }
}
```

2. **Monitor Core Web Vitals** via WebVitals component (already implemented)

3. **Regular bundle size checks** - Add to CI/CD pipeline

4. **A/B test optimizations** - Use feature flags for major changes

---

## Expected Results

With all optimizations implemented:

- **Initial Load**: 1.2s - 1.8s (currently ~3-4s estimated)
- **FCP**: < 1.0s
- **LCP**: < 1.5s
- **TTI**: < 2.0s
- **Bundle Size**: ~200-300KB (down from ~500-600KB estimated)

---

## Contact & Resources

- Next.js Performance Docs: https://nextjs.org/docs/app/building-your-application/optimizing
- React Performance: https://react.dev/reference/react/memo
- Web Vitals: https://web.dev/vitals/

---

**Last Updated**: 2025-10-21
**Status**: In Progress - Phase 1
