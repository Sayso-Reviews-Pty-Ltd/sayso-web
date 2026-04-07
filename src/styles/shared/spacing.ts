// Spacing system - consistent margins, paddings, gaps
export const spacing = {
  // Base spacing scale (in rem)
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
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// Common spacing patterns
export const spacingPatterns = {
  // Component padding
  cardPadding: "p-5 sm:p-7 md:p-9",
  sectionPadding: "px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
  containerPadding: "px-4 sm:px-6 lg:px-8",

  // Gaps
  gapXs: "gap-2",
  gapSm: "gap-3",
  gapMd: "gap-3",
  gapLg: "gap-6",
  gapXl: "gap-8",

  // Safe areas (for notches)
  safeAreaTop: "pt-[env(safe-area-inset-top)]",
  safeAreaBottom: "pb-[env(safe-area-inset-bottom)]",
  safeAreaLeft: "pl-[env(safe-area-inset-left)]",
  safeAreaRight: "pr-[env(safe-area-inset-right)]",
} as const;
