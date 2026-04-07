# Animation Guide - Smooth Scroll & Page Load Animations

This guide explains how to use the CSS-based smooth scrolling and page load animations throughout the KLIO application.

## Table of Contents

1. [Smooth Scrolling](#smooth-scrolling)
2. [Page Load Animations](#page-load-animations)
3. [Scroll Reveal Animations](#scroll-reveal-animations)
4. [Accessibility](#accessibility)

---

## Smooth Scrolling

### Global Smooth Scroll

Smooth scrolling is **automatically enabled** on all pages via `html { scroll-behavior: smooth; }` in [globals.css](src/app/globals.css#L108).

This means:

- All anchor links (`<a href="#section">`) scroll smoothly
- `window.scrollTo()` animations are smooth
- Browser back/forward navigation is smooth

### Example Usage

```tsx
// Anchor link - automatically smooth
<a href="#reviews">Jump to Reviews</a>

// Programmatic scroll - automatically smooth
<button onClick={() => window.scrollTo({ top: 0 })}>
  Back to Top
</button>
```

---

## Page Load Animations

### Using the PageLoad Component

The `PageLoad` component provides smooth entrance animations when a page loads.

**Import:**

```tsx
import PageLoad from "@/app/components/Animations/PageLoad";
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default"` \| `"fade"` \| `"slide"` | `"default"` | Animation style |
| `delay` | `1-6` | none | Stagger delay (0.1s increments) |
| `className` | `string` | `""` | Additional CSS classes |

**Available Variants:**

- `default`: Fade in + slide up (20px)
- `fade`: Simple fade in
- `slide`: Fade in + slide up (30px)

### Examples

**Basic Usage:**

```tsx
export default function MyPage() {
  return (
    <PageLoad variant="fade">
      <h1>Welcome to My Page</h1>
      <p>This content fades in on page load</p>
    </PageLoad>
  );
}
```

**Staggered Animations:**

```tsx
export default function MyPage() {
  return (
    <div>
      <PageLoad variant="slide" delay={1}>
        <Header />
      </PageLoad>

      <PageLoad variant="slide" delay={2}>
        <MainContent />
      </PageLoad>

      <PageLoad variant="slide" delay={3}>
        <Sidebar />
      </PageLoad>
    </div>
  );
}
```

**With Custom Classes:**

```tsx
<PageLoad variant="default" className="max-w-4xl mx-auto">
  <Article />
</PageLoad>
```

### Using CSS Classes Directly

If you prefer not to use the component, apply the CSS classes directly:

```tsx
<div className="page-load">
  Content with default animation
</div>

<div className="page-load-fade page-load-delay-1">
  Content that fades in with 0.1s delay
</div>

<div className="page-load-slide page-load-delay-2">
  Content that slides in with 0.2s delay
</div>
```

**Available CSS Classes:**

- `.page-load` - Default animation (fade + 20px slide)
- `.page-load-fade` - Fade animation only
- `.page-load-slide` - Fade + 30px slide animation
- `.page-load-delay-1` through `.page-load-delay-6` - Stagger delays

---

## Scroll Reveal Animations

Scroll reveal animations trigger when content comes into view while scrolling.

### Using the useScrollReveal Hook

**Import:**

```tsx
import useScrollReveal from "@/app/components/Animations/useScrollReveal";
```

**Basic Usage:**

```tsx
export default function MyComponent() {
  useScrollReveal(); // Activates all scroll-reveal elements

  return (
    <div>
      <div className="scroll-reveal">Fades in from bottom when scrolled into view</div>

      <div className="scroll-reveal-left">Fades in from left when scrolled into view</div>

      <div className="scroll-reveal-right">Fades in from right when scrolled into view</div>

      <div className="scroll-reveal-scale">Fades in with scale when scrolled into view</div>
    </div>
  );
}
```

**With Options:**

```tsx
useScrollReveal({
  threshold: 0.2, // Trigger when 20% visible
  rootMargin: "0px 0px -50px 0px", // Trigger 50px before entering viewport
});
```

**With Stagger Delays:**

```tsx
<div className="scroll-reveal stagger-1">Item 1 (0.1s delay)</div>
<div className="scroll-reveal stagger-2">Item 2 (0.2s delay)</div>
<div className="scroll-reveal stagger-3">Item 3 (0.3s delay)</div>
```

### Using a Ref (Single Element)

For targeting a specific element:

```tsx
import { useRef } from "react";
import { useScrollRevealRef } from "@/app/components/Animations/useScrollReveal";

export default function MyComponent() {
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollRevealRef(heroRef);

  return (
    <div ref={heroRef} className="scroll-reveal">
      This specific element will animate on scroll
    </div>
  );
}
```

### Available CSS Classes

| Class                        | Animation                    |
| ---------------------------- | ---------------------------- |
| `.scroll-reveal`             | Fade in from bottom (30px)   |
| `.scroll-reveal-left`        | Fade in from left (30px)     |
| `.scroll-reveal-right`       | Fade in from right (30px)    |
| `.scroll-reveal-scale`       | Fade in with scale (0.9 → 1) |
| `.stagger-1` to `.stagger-6` | Add delays (0.1s to 0.6s)    |

---

## Accessibility

### Reduced Motion Support

All animations **automatically respect** the `prefers-reduced-motion` setting.

When a user has "Reduce motion" enabled in their OS:

- All animations are disabled or reduced to instant transitions
- Page load animations show instantly
- Scroll reveals show instantly
- No performance impact

This is handled automatically in [globals.css](src/app/globals.css#L1173):

```css
@media (prefers-reduced-motion: reduce) {
  .page-load,
  .page-load-fade,
  .page-load-slide,
  .scroll-reveal,
  .scroll-reveal-left,
  .scroll-reveal-right,
  .scroll-reveal-scale {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
}
```

**No additional code required** - accessibility is built-in!

---

## Performance Tips

### Best Practices

1. **Use CSS animations over JavaScript** - Already implemented!
   - Better performance (GPU accelerated)
   - Lower CPU usage
   - Smoother on mobile devices

2. **Limit simultaneous animations**
   - Use stagger delays to avoid too many elements animating at once
   - Maximum 6 delay levels provided

3. **Keep animations short**
   - Page loads: 0.5-0.7s (already optimized)
   - Scroll reveals: 0.8s (already optimized)

4. **Use `will-change` sparingly**
   - Only applied to FloatingElements (already configured)
   - Removes after animation completes

### Animation Performance

All animations use:

- `cubic-bezier(0.25, 0.8, 0.25, 1)` - Smooth easing
- `transform` and `opacity` - GPU accelerated properties
- `forwards` fill-mode - No layout thrashing

---

## Examples from the Codebase

### Business Review Page

See: [src/app/business/review/page.tsx](src/app/business/review/page.tsx)

```tsx
<PageLoad variant="fade">
  <ReviewHeader />
</PageLoad>

<PageLoad variant="slide" delay={1} className="lg:col-span-8">
  <ReviewForm {...props} />
</PageLoad>

<PageLoad variant="slide" delay={2} className="lg:col-span-4">
  <ReviewSidebar {...props} />
</PageLoad>
```

### Adding to Other Pages

```tsx
// Example: Home page
import PageLoad from "@/app/components/Animations/PageLoad";
import useScrollReveal from "@/app/components/Animations/useScrollReveal";

export default function HomePage() {
  useScrollReveal();

  return (
    <div>
      <PageLoad variant="fade">
        <HeroSection />
      </PageLoad>

      <div className="scroll-reveal">
        <FeaturedBusinesses />
      </div>

      <div className="scroll-reveal-scale stagger-1">
        <Testimonials />
      </div>
    </div>
  );
}
```

---

## File Locations

**Components:**

- [PageLoad.tsx](src/app/components/Animations/PageLoad.tsx)
- [useScrollReveal.tsx](src/app/components/Animations/useScrollReveal.tsx)

**CSS:**

- [globals.css](src/app/globals.css) - Lines 108 (smooth scroll), 676-750 (page load), 807-849 (scroll reveal)

**Configuration:**

- [tailwind.config.js](tailwind.config.js)
- [next.config.ts](next.config.ts) - Scroll restoration enabled

---

## Browser Support

✅ **Fully Supported:**

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Android

✅ **Graceful Degradation:**

- Older browsers show content immediately (no animation)
- No JavaScript errors
- All content accessible

---

## Questions?

For issues or feature requests, refer to:

- [Animation components](src/app/components/Animations/)
- [Global CSS](src/app/globals.css)
- Next.js documentation: https://nextjs.org/docs
