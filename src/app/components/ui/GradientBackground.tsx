"use client";

/**
 * GradientBackground Component
 *
 * Reusable gradient background component that can be applied to any page/section.
 * Creates a smooth gradient from brand color (top-left) to white (bottom-right).
 * Can render as full background or as decorative blobs/objects.
 *
 * @example
 * // Full page gradient
 * <GradientBackground variant="full" />
 *
 * @example
 * // Decorative blobs
 * <GradientBackground variant="blobs" intensity="subtle" />
 */

interface GradientBackgroundProps {
  /** Gradient variant style */
  variant?: "full" | "blobs" | "radial" | "mesh";
  /** Visual intensity of the gradient */
  intensity?: "subtle" | "medium" | "strong";
  /** Primary brand color for gradient start */
  color?: "sage" | "coral" | "charcoal";
  /** Enable/disable animation */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function GradientBackground({
  variant = "full",
  intensity = "medium",
  color = "sage",
  animate = false,
  className = "",
}: GradientBackgroundProps) {

  // Color mappings for gradient start (top-left)
  const colorMap = {
    sage: {
      subtle: "rgba(116, 145, 118, 0.15)",    // 15% opacity
      medium: "rgba(116, 145, 118, 0.30)",    // 30% opacity
      strong: "rgba(116, 145, 118, 0.50)",    // 50% opacity
    },
    coral: {
      subtle: "rgba(214, 116, 105, 0.15)",
      medium: "rgba(214, 116, 105, 0.30)",
      strong: "rgba(214, 116, 105, 0.50)",
    },
    charcoal: {
      subtle: "rgba(33, 30, 29, 0.08)",
      medium: "rgba(33, 30, 29, 0.15)",
      strong: "rgba(33, 30, 29, 0.25)",
    },
  };

  const startColor = colorMap[color][intensity];
  const endColor = "rgba(255, 255, 255, 0)"; // Transparent white

  // Full gradient background (top-left to bottom-right)
  if (variant === "full") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${animate ? "animate-gradient" : ""} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  // Radial gradient (circular fade from center)
  if (variant === "radial") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${animate ? "animate-pulse-slow" : ""} ${className}`}
        style={{
          background: `radial-gradient(circle at top left, ${startColor} 0%, ${endColor} 70%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  // Mesh gradient (multiple gradient points)
  if (variant === "mesh") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div
          className={`absolute inset-0 ${animate ? "animate-gradient" : ""}`}
          style={{
            background: `
              radial-gradient(circle at 0% 0%, ${startColor} 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, ${startColor} 0%, transparent 50%)
            `,
          }}
        />
      </div>
    );
  }

  // Blobs variant - decorative gradient shapes
  if (variant === "blobs") {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
        {/* Top-left blob - brand color to white */}
        <div
          className={`absolute -top-20 -left-20 md:-top-32 md:-left-32 w-64 h-64 md:w-96 md:h-96 rounded-full ${animate ? "animate-float" : ""}`}
          style={{
            background: `radial-gradient(circle, ${startColor} 0%, ${endColor} 70%)`,
            filter: "blur(60px)",
          }}
        />

        {/* Top-right accent blob */}
        <div
          className={`absolute -top-10 -right-10 md:-top-16 md:-right-16 w-48 h-48 md:w-72 md:h-72 rounded-full ${animate ? "animate-float-delayed" : ""}`}
          style={{
            background: `radial-gradient(circle, ${startColor} 0%, ${endColor} 60%)`,
            filter: "blur(50px)",
            animationDelay: "1s",
          }}
        />

        {/* Bottom-left accent blob */}
        <div
          className={`absolute -bottom-16 -left-16 md:-bottom-24 md:-left-24 w-56 h-56 md:w-80 md:h-80 rounded-full ${animate ? "animate-float" : ""}`}
          style={{
            background: `radial-gradient(circle, ${startColor} 0%, ${endColor} 65%)`,
            filter: "blur(70px)",
            animationDelay: "0.5s",
          }}
        />

        {/* Bottom-right blob - white dominant (subtle brand tint) */}
        <div
          className={`absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full ${animate ? "animate-float-delayed" : ""}`}
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, ${endColor} 100%)`,
            filter: "blur(80px)",
            animationDelay: "1.5s",
          }}
        />
      </div>
    );
  }

  return null;
}

// CSS animations (add to globals.css or use inline styles)
export const gradientAnimationStyles = `
  @keyframes gradient-shift {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(10px, -10px) scale(1.05); }
    66% { transform: translate(-10px, 10px) scale(0.95); }
  }

  .animate-gradient {
    animation: gradient-shift 8s ease-in-out infinite;
  }

  .animate-float {
    animation: float 20s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float 25s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-gradient,
    .animate-float,
    .animate-float-delayed,
    .animate-pulse-slow {
      animation: none !important;
    }
  }
`;
