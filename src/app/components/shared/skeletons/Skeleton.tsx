import React from "react";
import { Skeleton as SkeletonPrimitive } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  radius?: string;
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style = {},
  radius = "rounded-xl",
  shimmer = true,
}) => (
  <SkeletonPrimitive
    className={cn(
      "bg-gradient-to-r from-card-bg/60 via-card-bg/40 to-card-bg/60 relative overflow-hidden",
      radius,
      className
    )}
    style={style}
  >
    {shimmer && (
      <span className="absolute inset-0 block bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    )}
  </SkeletonPrimitive>
);

export default Skeleton;
