"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PerformanceConfig {
  isDev: boolean;
  disableLinkPrefetch: boolean;
  imageQuality: number;
  enableAnimations: boolean;
  prefersReducedMotion: boolean;
  connectionQuality: "slow" | "medium" | "fast";
}

interface PerformanceContextType {
  config: PerformanceConfig;
  updateConfig: (updates: Partial<PerformanceConfig>) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
};

// Detect network quality
const getNetworkQuality = (): "slow" | "medium" | "fast" => {
  if (typeof navigator === "undefined") return "medium";

  // @ts-ignore - navigator.connection is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) return "medium";

  const { downlink, effectiveType, rtt } = connection;

  // Determine quality based on metrics
  if (effectiveType === "slow-2g" || effectiveType === "2g" || downlink < 1 || rtt > 1000) {
    return "slow";
  }

  if (effectiveType === "4g" && downlink > 5 && rtt < 150) {
    return "fast";
  }

  return "medium";
};

// Check for reduced motion preference
const getPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PerformanceConfig>(() => ({
    isDev: process.env.NODE_ENV === "development",
    disableLinkPrefetch: process.env.DISABLE_LINK_PREFETCH === "true",
    imageQuality: 85,
    enableAnimations: true,
    prefersReducedMotion: false,
    connectionQuality: "medium",
  }));

  useEffect(() => {
    // Update performance config based on environment and user preferences
    const networkQuality = getNetworkQuality();
    const prefersReducedMotion = getPrefersReducedMotion();

    setConfig((prev) => ({
      ...prev,
      connectionQuality: networkQuality,
      prefersReducedMotion,
      enableAnimations: !prefersReducedMotion,
      // Adjust image quality based on network
      imageQuality: networkQuality === "slow" ? 60 : networkQuality === "fast" ? 90 : 75,
    }));

    // Listen for network changes
    // @ts-ignore
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const handleChange = () => {
        const newQuality = getNetworkQuality();
        setConfig((prev) => ({
          ...prev,
          connectionQuality: newQuality,
          imageQuality: newQuality === "slow" ? 60 : newQuality === "fast" ? 90 : 75,
        }));
      };

      connection.addEventListener("change", handleChange);
      return () => connection.removeEventListener("change", handleChange);
    }
  }, []);

  const updateConfig = (updates: Partial<PerformanceConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <PerformanceContext.Provider value={{ config, updateConfig }}>
      {children}
    </PerformanceContext.Provider>
  );
}
