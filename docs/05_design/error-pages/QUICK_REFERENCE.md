# Error Pages - Quick Reference Guide

## 🎯 Quick Start

### Import and Use

```typescript
import ErrorPage from "@/app/components/ErrorPages/ErrorPage";

// Minimal usage (uses defaults for error type)
<ErrorPage errorType="404" />

// Full customization
<ErrorPage
  errorType="500"
  title="Custom Title"
  description="Custom description"
  primaryAction={{
    label: "Action",
    href: "/path",
  }}
/>
```

## 📋 Error Types Supported

| Type    | Use Case                | Default Button       |
| ------- | ----------------------- | -------------------- |
| `404`   | Page not found          | Go Home → /interests |
| `401`   | Authentication required | Go Home → /interests |
| `403`   | Access denied           | Go Home → /interests |
| `500`   | Server error            | Go Home → /interests |
| `503`   | Service unavailable     | Check Status → /     |
| `error` | Generic error           | Go Home → /interests |

## 🎨 Colors Used

```css
Sage:      #7D9B76  /* Primary - buttons, accents */
Charcoal:  #2D2D2D  /* Text */
Off-white: #E5E0E5  /* Background */
```

## 🧩 Component Props

```typescript
interface ErrorPageProps {
  errorType?: ErrorType; // Default: "error"
  title?: string; // Override default
  description?: string; // Override default
  icon?: React.ReactNode; // Custom icon
  primaryAction?: {
    // Override primary button
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    // Optional second button
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  showContactSupport?: boolean; // Show support (default: true)
  supportEmail?: string; // Support email
}
```

## 🔧 Common Implementations

### 404 Not Found

```typescript
<ErrorPage
  errorType="404"
  secondaryAction={{
    label: "Go Back",
    onClick: () => window.history.back(),
  }}
/>
```

### 401 Unauthorized

```typescript
<ErrorPage
  errorType="401"
  secondaryAction={{
    label: "Try Again",
    onClick: () => window.history.back(),
  }}
/>
```

### 500 Server Error

```typescript
<ErrorPage
  errorType="500"
  primaryAction={{
    label: "Retry",
    href: "/",
  }}
/>
```

### Custom Error

```typescript
<ErrorPage
  errorType="error"
  title="Your Title"
  description="Your description"
  primaryAction={{
    label: "Your Action",
    href: "/your-path",
  }}
/>
```

## 🚀 With Error Boundary

```typescript
import { ErrorBoundary } from "@/app/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## 📁 File Locations

- **Component**: `src/app/components/ErrorPages/ErrorPage.tsx`
- **Error Boundary**: `src/app/components/ErrorBoundary/ErrorBoundary.tsx`
- **Onboarding Boundary**: `src/app/components/Onboarding/OnboardingErrorBoundary.tsx`
- **404 Page**: `src/app/not-found.tsx`
- **Auth Error**: `src/app/auth/auth-code-error/page.tsx`

## 📚 Documentation

- **Full Guide**: `ERROR_DESIGN_SYSTEM.md`
- **Examples**: `IMPLEMENTATION_EXAMPLES.md`
- **Summary**: `CONSOLIDATED_ERROR_PAGES_SUMMARY.md`

## ✅ Design System Features

✅ Premium, minimal design
✅ Consistent color palette (Sage, Charcoal, Off-white)
✅ Responsive (mobile, tablet, desktop)
✅ Smooth animations
✅ Accessible (WCAG AA)
✅ Customizable
✅ Easy to maintain

## ⚡ Performance

- ~5KB component size
- CSS transforms only (performant)
- No external dependencies beyond react-icons
- Fast animations with no layout shifts

## ♿ Accessibility

✓ 4.5:1 color contrast (WCAG AA)
✓ Visible focus states
✓ Keyboard navigable
✓ Clear error messages
✓ Works with screen readers

## 💡 Best Practices

1. **Be Specific**: Explain what went wrong
2. **Provide Action**: Give users a clear next step
3. **Stay Minimal**: Don't over-decorate
4. **Use Brand Colors**: Sage for CTAs
5. **Maintain Consistency**: Use the component, not custom designs
6. **Accessibility First**: Always test with keyboard and screen reader

## ❓ FAQ

**Q: How do I create a custom error page?**
A: Use `ErrorPage` with custom `title`, `description`, and actions.

**Q: Can I change the colors?**
A: Customize within the component or pass custom icon/styling via props.

**Q: Does it work with Server Components?**
A: No, marked with `"use client"`. Wrap server components if needed.

**Q: Can I use this in modals?**
A: Yes, adjust max-width or integrate as overlay.

---

**For more details, see:**

- [ERROR_DESIGN_SYSTEM.md](./ERROR_DESIGN_SYSTEM.md)
- [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)
