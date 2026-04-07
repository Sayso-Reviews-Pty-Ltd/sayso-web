// Animation utilities - consistent motion across the app
export const animations = {
  // Timing functions
  timing: {
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Durations
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Keyframes
  keyframes: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,
} as const;

// Animation classes
export const animationClasses = {
  fadeInUp: "animate-[fadeInUp_0.6s_ease-out_forwards]",
  slideInLeft: "animate-[slideInLeft_0.6s_ease-out_forwards]",
  slideInRight: "animate-[slideInRight_0.6s_ease-out_forwards]",
  scaleIn: "animate-[scaleIn_0.8s_ease-out_forwards]",
  spin: "animate-spin",
  pulse: "animate-pulse",

  // Delays
  delay100: "animation-delay-[0.1s]",
  delay200: "animation-delay-[0.2s]",
  delay300: "animation-delay-[0.3s]",
  delay400: "animation-delay-[0.4s]",
  delay700: "animation-delay-[0.7s]",
} as const;

// Reduced motion support
export const reducedMotion = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
