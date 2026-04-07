# Component Library

KLIO uses an **Atomic Design** methodology for organizing UI components.

## Atomic Design Structure

```
src/components/
├── atoms/           # Basic building blocks
├── molecules/       # Simple combinations of atoms
├── organisms/       # Complex UI sections
└── templates/       # Page-level layouts
```

## Design Principles

### 1. Consistency

- Use design tokens for colors, spacing, typography
- Follow established patterns throughout the app
- Maintain consistent component APIs

### 2. Reusability

- Build generic, composable components
- Avoid page-specific logic in shared components
- Use props for configuration, not hardcoded values

### 3. Accessibility

- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

### 4. Performance

- Optimize re-renders with React.memo
- Use CSS for animations
- Lazy load heavy components
- Optimize images

## Design Tokens

### Colors

```typescript
const colors = {
  // Primary
  coral: "#FF6B6B",
  sage: "#8FBC8F",
  cream: "#FFF8E7",
  charcoal: "#2D2D2D",

  // Secondary
  "off-white": "#F8F9FA",
  "light-gray": "#E9ECEF",
  "medium-gray": "#6C757D",

  // Status
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#17A2B8",
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    display: "Poppins, sans-serif",
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

### Spacing

```typescript
const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
};
```

### Border Radius

```typescript
const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  DEFAULT: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.5rem", // 24px
  "2xl": "2rem", // 32px
  full: "9999px",
};
```

## Component Categories

### Atoms

**Purpose:** Basic building blocks that can't be broken down further.

**Examples:**

- Button
- Input
- Label
- Icon
- Badge
- Avatar
- Spinner

**Guidelines:**

- Single responsibility
- No dependencies on other components
- Highly reusable
- Accept styling props

**Example:**

```typescript
// src/components/atoms/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Molecules

**Purpose:** Simple combinations of atoms that work together.

**Examples:**

- FormField (Label + Input + Error)
- SearchBar (Input + Button)
- Card (Image + Title + Description)
- Rating (Stars + Count)
- PriceDisplay (Icon + Text + Badge)

**Guidelines:**

- Combine 2-5 atoms
- Single clear purpose
- Reusable across contexts
- Minimal business logic

**Example:**

```typescript
// src/components/molecules/FormField/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
}) => {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
};
```

### Organisms

**Purpose:** Complex UI sections made of molecules and atoms.

**Examples:**

- Header (Logo + Navigation + User Menu)
- BusinessCard (Image + Details + Actions)
- ReviewList (Multiple ReviewCards)
- FilterPanel (Multiple FilterGroups)
- Footer (Links + Social + Newsletter)

**Guidelines:**

- Feature-specific but reusable
- May contain business logic
- Composed of molecules and atoms
- Self-contained functionality

**Example:**

```typescript
// src/components/organisms/BusinessCard/BusinessCard.tsx
interface BusinessCardProps {
  business: Business;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onFavorite,
  onShare,
}) => {
  return (
    <Card>
      <CardImage src={business.image} alt={business.name} />
      <CardContent>
        <CardTitle>{business.name}</CardTitle>
        <Rating value={business.rating} count={business.reviews} />
        <PriceDisplay range={business.priceRange} />
        <CardActions>
          <Button onClick={() => onFavorite?.(business.id)}>
            Favorite
          </Button>
          <Button onClick={() => onShare?.(business.id)}>
            Share
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};
```

### Templates

**Purpose:** Page-level layouts that define structure.

**Examples:**

- MainLayout (Header + Content + Footer)
- AuthLayout (Centered form with background)
- DashboardLayout (Sidebar + Main content)

**Guidelines:**

- Define page structure
- Handle responsive layouts
- Manage global UI state
- Compose organisms

## Common Components

### Button Variants

```typescript
// Primary - Main actions
<Button variant="primary">Sign Up</Button>

// Secondary - Less important actions
<Button variant="secondary">Learn More</Button>

// Outline - Tertiary actions
<Button variant="outline">Cancel</Button>

// Ghost - Minimal emphasis
<Button variant="ghost">Skip</Button>

// With icon
<Button icon={<PlusIcon />}>Add Business</Button>

// Loading state
<Button loading>Saving...</Button>

// Disabled
<Button disabled>Unavailable</Button>
```

### Input Fields

```typescript
// Text input
<Input
  type="text"
  placeholder="Enter your name"
  value={value}
  onChange={setValue}
/>

// With validation
<FormField label="Email" error={errors.email}>
  <Input
    type="email"
    value={email}
    onChange={setEmail}
  />
</FormField>

// Textarea
<Textarea
  placeholder="Write your review..."
  rows={5}
/>

// Select
<Select
  options={categories}
  value={selected}
  onChange={setSelected}
/>
```

### Cards

```typescript
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Business Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Description</p>
  </CardContent>
</Card>

// With image
<Card>
  <CardImage src={image} alt="Business" />
  <CardContent>
    <CardTitle>Business Name</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>

// Hover effects
<Card hoverable onClick={handleClick}>
  {/* content */}
</Card>
```

### Modals & Dialogs

```typescript
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Confirm Action</ModalTitle>
  </ModalHeader>
  <ModalContent>
    <p>Are you sure you want to continue?</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="outline" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

## Animation Patterns

See [Animation Guide](ANIMATION_GUIDE.md) for detailed animation documentation.

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide up */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
};
```

### Mobile-First Approach

```css
/* Mobile styles (default) */
.component {
  font-size: 14px;
  padding: 8px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    font-size: 16px;
    padding: 12px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    font-size: 18px;
    padding: 16px;
  }
}
```

## Accessibility Guidelines

### Semantic HTML

```tsx
// Good
<button onClick={handleClick}>Click me</button>

// Bad
<div onClick={handleClick}>Click me</div>
```

### ARIA Labels

```tsx
<button aria-label="Close modal" onClick={handleClose}>
  <XIcon />
</button>
```

### Keyboard Navigation

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
>
  Click me
</div>
```

### Focus Management

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />;
```

## Best Practices

### Do's ✅

- Use semantic HTML
- Follow established patterns
- Make components accessible
- Write prop documentation
- Test component variants
- Optimize for performance
- Use TypeScript for type safety

### Don'ts ❌

- Don't hardcode values
- Don't mix concerns
- Don't skip accessibility
- Don't create one-off components
- Don't ignore responsive design
- Don't skip error states
- Don't forget loading states

## Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

## Further Reading

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Component Patterns](https://react.dev/learn/thinking-in-react)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
