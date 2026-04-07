# Optimization Checklist

Use this checklist to ensure your code follows performance best practices for KLIO.

## ✅ Code Performance

### React Components

- [ ] Use `React.memo()` for expensive pure components
- [ ] Implement `useMemo()` for expensive calculations
- [ ] Use `useCallback()` for event handlers passed to children
- [ ] Avoid inline object/array creation in render
- [ ] Use `key` prop correctly in lists
- [ ] Lazy load heavy components with `React.lazy()`
- [ ] Avoid deep component nesting (keep < 5 levels)

### State Management

- [ ] Minimize state updates
- [ ] Use local state when possible (avoid global state)
- [ ] Batch state updates together
- [ ] Use refs for non-rendering values
- [ ] Avoid unnecessary re-renders with proper dependency arrays

### Data Fetching

- [ ] Implement proper loading states
- [ ] Cache API responses where appropriate
- [ ] Use SWR or React Query for data fetching
- [ ] Implement proper error handling
- [ ] Add request deduplication
- [ ] Use optimistic updates for better UX

## 🎨 UI/UX Performance

### Images

- [ ] Use Next.js `Image` component
- [ ] Specify width and height
- [ ] Use appropriate image formats (WebP when possible)
- [ ] Implement lazy loading for below-fold images
- [ ] Optimize image sizes (< 100KB for thumbnails)
- [ ] Use `priority` for above-fold images
- [ ] Implement responsive images with `srcset`

### CSS

- [ ] Avoid large CSS files (split by route)
- [ ] Use CSS modules or Tailwind for scoping
- [ ] Minimize runtime style calculations
- [ ] Avoid deep CSS selectors
- [ ] Use `will-change` sparingly
- [ ] Prefer transforms over layout properties for animations

### Fonts

- [ ] Use `next/font` for font optimization
- [ ] Preload critical fonts
- [ ] Use `font-display: swap` or `optional`
- [ ] Limit font weights and styles
- [ ] Use system fonts when appropriate

### Animations

- [ ] Use CSS transforms (not top/left)
- [ ] Use `transform` and `opacity` for GPU acceleration
- [ ] Keep animations under 16ms per frame
- [ ] Use `requestAnimationFrame` for JS animations
- [ ] Implement reduced motion media queries

## 🗄️ Database Performance

### Queries

- [ ] Add indexes for frequently queried columns
- [ ] Use `EXPLAIN ANALYZE` to verify query plans
- [ ] Avoid SELECT \* (select only needed columns)
- [ ] Use pagination for large result sets
- [ ] Implement query result caching
- [ ] Use database views for complex queries

### Writes

- [ ] Batch inserts when possible
- [ ] Use upserts to avoid duplicate checks
- [ ] Minimize transaction scope
- [ ] Use database functions for complex operations
- [ ] Implement optimistic locking for conflicts

### Schema

- [ ] Denormalize for read-heavy tables
- [ ] Use appropriate column types
- [ ] Add foreign key constraints
- [ ] Enable RLS policies
- [ ] Regular VACUUM and ANALYZE

## 🌐 API Performance

### Route Handlers

- [ ] Implement request validation
- [ ] Add rate limiting
- [ ] Use streaming for large responses
- [ ] Implement proper error handling
- [ ] Add request logging
- [ ] Use caching headers appropriately

### External APIs

- [ ] Add timeout limits
- [ ] Implement retry logic with backoff
- [ ] Cache responses when appropriate
- [ ] Use webhooks instead of polling
- [ ] Batch requests when possible

## 📦 Build Performance

### Bundle Size

- [ ] Code split by route
- [ ] Use dynamic imports for heavy libraries
- [ ] Remove unused dependencies
- [ ] Analyze bundle with `@next/bundle-analyzer`
- [ ] Tree-shake unused code
- [ ] Use production builds for deployment

### Build Time

- [ ] Use incremental builds
- [ ] Minimize file watching overhead
- [ ] Parallelize build tasks
- [ ] Cache build artifacts
- [ ] Use SWC instead of Babel

## 🔒 Security Performance

### Authentication

- [ ] Use secure session management
- [ ] Implement proper token expiration
- [ ] Add CSRF protection
- [ ] Use secure cookies
- [ ] Implement rate limiting on auth endpoints

### Data Protection

- [ ] Enable RLS on all tables
- [ ] Validate all user inputs
- [ ] Sanitize data before storage
- [ ] Use parameterized queries
- [ ] Implement proper error messages (no leaks)

## 📊 Monitoring & Metrics

### Logging

- [ ] Log errors with context
- [ ] Track performance metrics
- [ ] Monitor API response times
- [ ] Track database query times
- [ ] Implement user analytics

### Error Handling

- [ ] Add error boundaries
- [ ] Implement graceful degradation
- [ ] Show user-friendly error messages
- [ ] Track error rates
- [ ] Implement error reporting (Sentry, etc.)

## 🧪 Testing Performance

### Test Strategy

- [ ] Write unit tests for utilities
- [ ] Add integration tests for critical paths
- [ ] Implement E2E tests for user flows
- [ ] Test error scenarios
- [ ] Test loading states

### Performance Testing

- [ ] Run Lighthouse audits
- [ ] Test on slow networks
- [ ] Test on low-end devices
- [ ] Measure Core Web Vitals
- [ ] Load test API endpoints

## 📱 Mobile Performance

### Responsive Design

- [ ] Test on multiple screen sizes
- [ ] Implement touch-friendly UI (44px minimum)
- [ ] Optimize for mobile networks
- [ ] Use mobile-first approach
- [ ] Test with mobile device emulation

### Mobile Optimization

- [ ] Reduce JavaScript bundle for mobile
- [ ] Implement service workers (PWA)
- [ ] Use native browser features
- [ ] Optimize for mobile data usage
- [ ] Test on actual devices

## 🔄 Continuous Optimization

### Regular Audits

- [ ] Run Lighthouse monthly
- [ ] Review bundle size weekly
- [ ] Check database query performance
- [ ] Monitor error rates
- [ ] Review user feedback

### Performance Budget

- [ ] Set size budget for bundles
- [ ] Set performance budgets for metrics
- [ ] Enforce budgets in CI/CD
- [ ] Review budget violations
- [ ] Update budgets as needed

## Tools & Resources

### Measurement

- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- Bundle Analyzer
- React DevTools Profiler

### Optimization

- Next.js Image Optimization
- Supabase Query Performance
- React Performance DevTools
- Webpack Bundle Analyzer

### Monitoring

- Vercel Analytics
- Sentry Error Tracking
- PostHog Analytics
- Supabase Dashboard

## Quick Wins

Start with these for immediate improvements:

1. ✅ Add `React.memo()` to expensive components
2. ✅ Use Next.js `Image` component everywhere
3. ✅ Add database indexes for common queries
4. ✅ Implement proper loading states
5. ✅ Enable caching headers on API routes
6. ✅ Lazy load below-fold content
7. ✅ Optimize images (compress, WebP format)
8. ✅ Use code splitting for large pages

## Before Every PR

- [ ] Run `npm run lint`
- [ ] Check bundle size impact
- [ ] Test loading states
- [ ] Verify mobile responsiveness
- [ ] Check console for warnings
- [ ] Run Lighthouse on affected pages
- [ ] Test error scenarios

## References

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [Supabase Performance Tips](https://supabase.com/docs/guides/platform/performance)
