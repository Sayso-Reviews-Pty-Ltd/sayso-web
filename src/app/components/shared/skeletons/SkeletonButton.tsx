import React from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

interface SkeletonButtonProps {
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  className = "",
  height = "h-10",
  width = "w-32",
}) => <Skeleton className={cn("inline-block rounded-full", height, width, className)} />;

export default SkeletonButton;
