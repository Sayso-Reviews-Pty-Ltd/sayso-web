"use client";

import { ReactNode } from "react";

interface PageLoadProps {
  children: ReactNode;
  variant?: "default" | "fade" | "slide";
  delay?: number;
  className?: string;
}

/**
 * PageLoad Component - Pure CSS-based page load animation wrapper
 *
 * Usage:
 * <PageLoad variant="default">
 *   <YourContent />
 * </PageLoad>
 *
 * Props:
 * - variant: "default" | "fade" | "slide" - Animation style
 * - delay: 1-6 - Stagger delay (0.1s increments)
 * - className: Additional CSS classes
 */
export default function PageLoad({
  children,
  variant = "default",
  delay,
  className = "",
}: PageLoadProps) {
  const animationClass =
    variant === "fade" ? "page-load-fade" : variant === "slide" ? "page-load-slide" : "page-load";

  const delayClass = delay && delay >= 1 && delay <= 6 ? `page-load-delay-${delay}` : "";

  return <div className={`${animationClass} ${delayClass} ${className}`.trim()}>{children}</div>;
}
