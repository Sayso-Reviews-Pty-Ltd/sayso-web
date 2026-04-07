"use client";

import Link from "next/link";
import { usePerformance } from "./PerformanceProvider";
import { ReactNode, forwardRef, useMemo } from "react";

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean | null;
  priority?: "high" | "medium" | "low";
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
  onMouseEnter?: () => void;
  onTouchStart?: () => void;
  onClick?: () => void;
}

// Critical routes that should always prefetch
const CRITICAL_ROUTES = ["/", "/home", "/saved", "/leaderboard"];

// Routes that should never prefetch
const NEVER_PREFETCH_ROUTES = ["/auth", "/api", "/admin"];

// Determine if a route should be prefetched based on priority and performance settings
const shouldPrefetch = (
  href: string,
  explicitPrefetch: boolean | null | undefined,
  priority: "high" | "medium" | "low",
  disableLinkPrefetch: boolean,
  connectionQuality: "slow" | "medium" | "fast"
): boolean => {
  // Explicit prefetch setting takes precedence
  if (explicitPrefetch !== undefined && explicitPrefetch !== null) {
    return explicitPrefetch;
  }

  // Never prefetch certain routes
  if (NEVER_PREFETCH_ROUTES.some((route) => href.startsWith(route))) {
    return false;
  }

  // Don't prefetch in development or on slow connections
  if (disableLinkPrefetch || connectionQuality === "slow") {
    return false;
  }

  // Always prefetch critical routes
  if (CRITICAL_ROUTES.includes(href)) {
    return true;
  }

  // Prefetch based on priority and connection quality
  switch (priority) {
    case "high":
      return true;
    case "medium":
      return connectionQuality === "fast";
    case "low":
      return false;
    default:
      return connectionQuality === "fast";
  }
};

const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  (
    {
      href,
      children,
      className,
      prefetch,
      priority = "medium",
      replace,
      scroll,
      shallow,
      passHref,
      legacyBehavior,
      onMouseEnter,
      onTouchStart,
      onClick,
      ...props
    },
    ref
  ) => {
    const { config } = usePerformance();

    // Memoize prefetch decision to avoid recalculation
    const shouldPrefetchRoute = useMemo(
      () =>
        shouldPrefetch(
          href,
          prefetch,
          priority,
          config.disableLinkPrefetch,
          config.connectionQuality
        ),
      [href, prefetch, priority, config.disableLinkPrefetch, config.connectionQuality]
    );

    // Enhanced event handlers for performance
    const handleMouseEnter = () => {
      // Prefetch on hover for better UX (if not already prefetched)
      if (!shouldPrefetchRoute && config.connectionQuality !== "slow") {
        // Manual prefetch logic here if needed
      }
      onMouseEnter?.();
    };

    const handleTouchStart = () => {
      // Prefetch on touch start for mobile
      if (!shouldPrefetchRoute && config.connectionQuality !== "slow") {
        // Manual prefetch logic here if needed
      }
      onTouchStart?.();
    };

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        prefetch={shouldPrefetchRoute}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref={passHref}
        legacyBehavior={legacyBehavior}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

OptimizedLink.displayName = "OptimizedLink";

export default OptimizedLink;
