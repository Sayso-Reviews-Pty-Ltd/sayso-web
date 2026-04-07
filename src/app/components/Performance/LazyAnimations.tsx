// High-performance lazy-loaded animation components
"use client";

import dynamic from "next/dynamic";
import { ReactNode, ComponentProps } from "react";

// Lightweight fallback components (no animations)
const StaticDiv = ({ children, className, style, ...props }: ComponentProps<"div">) => (
  <div className={className} style={style} {...props}>
    {children}
  </div>
);

const StaticButton = ({ children, className, style, ...props }: ComponentProps<"button">) => (
  <button className={className} style={style} {...props}>
    {children}
  </button>
);

// Lazy-loaded motion components (only load when needed)
export const LazyMotionDiv = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => null,
  }
);

export const LazyMotionButton = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.button })),
  {
    ssr: false,
    loading: () => null,
  }
);

export const LazyMotionSection = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.section })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Smart motion wrapper - only loads motion when needed
interface SmartMotionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enableAnimations?: boolean;
  as?: "div" | "button" | "section";
  motionProps?: any;
}

export function SmartMotion({
  children,
  className,
  style,
  enableAnimations = true,
  as = "div",
  motionProps = {},
  ...props
}: SmartMotionProps) {
  // If animations are disabled or we're on slow connection, use static components
  if (
    !enableAnimations ||
    (typeof navigator !== "undefined" &&
      "connection" in navigator &&
      (navigator as any).connection?.effectiveType === "2g")
  ) {
    switch (as) {
      case "button":
        return (
          <StaticButton className={className} style={style} {...props}>
            {children}
          </StaticButton>
        );
      case "section":
        return (
          <section className={className} style={style} {...props}>
            {children}
          </section>
        );
      default:
        return (
          <StaticDiv className={className} style={style} {...props}>
            {children}
          </StaticDiv>
        );
    }
  }

  // Use lazy-loaded motion components
  switch (as) {
    case "button":
      return (
        <LazyMotionButton className={className} style={style} {...motionProps} {...props}>
          {children}
        </LazyMotionButton>
      );
    case "section":
      return (
        <LazyMotionSection className={className} style={style} {...motionProps} {...props}>
          {children}
        </LazyMotionSection>
      );
    default:
      return (
        <LazyMotionDiv className={className} style={style} {...motionProps} {...props}>
          {children}
        </LazyMotionDiv>
      );
  }
}

// Preload animations on user interaction
export const preloadAnimations = () => {
  if (typeof window !== "undefined") {
    // Only preload if not on slow connection
    const connection = (navigator as any).connection;
    if (!connection || connection.effectiveType !== "2g") {
      import("framer-motion");
    }
  }
};

// Hook for performance-aware animations
export const usePerformanceAwareAnimations = () => {
  if (typeof window === "undefined") return false;

  const connection = (navigator as any).connection;
  const isSlowConnection = connection?.effectiveType === "2g";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return !isSlowConnection && !prefersReducedMotion;
};
