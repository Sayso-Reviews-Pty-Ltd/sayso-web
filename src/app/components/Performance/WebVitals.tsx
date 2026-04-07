"use client";

import { useEffect } from "react";

function WebVitals() {
  useEffect(() => {
    // Skip in development to improve performance
    if (process.env.NODE_ENV === "development") {
      return;
    }

    // Only load web-vitals in the browser and if available
    if (typeof window !== "undefined") {
      import("web-vitals")
        .then((webVitals) => {
          const reportMetric = (metric: { name: string; value: number; rating: string }) => {
            // Log vitals in development, send to analytics in production
            if (process.env.NODE_ENV === "development") {
              console.log(`${metric.name}:`, metric.value, metric.rating);
            }

            // Production: Send to your analytics provider
            // Example: gtag('event', metric.name, { value: metric.value });
          };

          // Measure and report Core Web Vitals
          webVitals.onCLS?.(reportMetric);
          // onFID is deprecated in favor of onINP in newer versions
          if (webVitals.onINP) {
            webVitals.onINP(reportMetric);
          }
          webVitals.onFCP?.(reportMetric);
          webVitals.onLCP?.(reportMetric);
          webVitals.onTTFB?.(reportMetric);
        })
        .catch((error) => {
          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.warn("Web Vitals library not available:", error.message);
          }
        });
    }
  }, []);

  return null;
}

export default WebVitals;
