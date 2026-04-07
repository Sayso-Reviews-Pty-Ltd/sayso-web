// Performance monitoring utilities

export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${metric.name}:`, metric.value);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // You can send to your analytics service here
    // Example: analytics.track('Web Vitals', metric);
  }
}

// Measure component render time
export function measureComponentRender(componentName: string) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) {
      // Longer than one frame (60fps)
      console.warn(
        `[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms to render`
      );
    }
  };
}

// Preload critical resources
export function preloadResource(url: string, type: "image" | "font" | "script" | "style") {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = type;

  if (type === "font") {
    link.crossOrigin = "anonymous";
  }

  document.head.appendChild(link);
}

// Debounce function for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
