// Typography system - mobile-first with proper scaling
export const typography = {
  // Font families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace',
  },

  // Font sizes (mobile-first, min 16px for inputs)
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px (minimum for mobile inputs)
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  // Line heights
  lineHeight: {
    tight: "1.2",
    snug: "1.3",
    normal: "1.5",
    relaxed: "1.6",
    loose: "1.8",
  },

  // Font weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

// Tailwind typography classes
export const textStyles = {
  // Headings
  h1: "text-lg md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
  h2: "text-lg md:text-lg lg:text-4xl font-bold leading-tight tracking-tight",
  h3: "text-xl md:text-lg lg:text-lg font-bold leading-snug",
  h4: "text-lg md:text-xl font-semibold leading-snug",
  h5: "text-base md:text-lg font-semibold leading-normal",
  h6: "text-base font-semibold leading-normal",

  // Body text
  bodyLg: "text-lg leading-relaxed",
  body: "text-base leading-normal",
  bodySm: "text-sm leading-normal",

  // Special
  caption: "text-xs leading-normal text-charcoal/70",
  label: "text-sm font-medium leading-normal",
  button: "text-base font-semibold leading-none",
} as const;
