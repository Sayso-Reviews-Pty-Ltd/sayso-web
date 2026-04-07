// Lazy-loaded Framer Motion components for better performance
"use client";

import dynamic from "next/dynamic";
import { Suspense, ReactNode } from "react";

// Lazy load motion components
export const LazyMotionDiv = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => <div className="opacity-0" />,
  }
);

export const LazyMotionButton = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.motion.button })),
  {
    ssr: false,
    loading: () => <button className="opacity-0" />,
  }
);

// Motion wrapper with suspense
interface LazyMotionWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyMotionWrapper({ children, fallback }: LazyMotionWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 rounded" />}>
      {children}
    </Suspense>
  );
}

// Preload motion when user interacts
export const preloadMotion = () => {
  if (typeof window !== "undefined") {
    import("framer-motion");
  }
};
