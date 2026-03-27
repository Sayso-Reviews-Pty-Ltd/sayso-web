import React from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

interface SkeletonCardProps {
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = "",
  height = "h-32",
  width = "w-full",
}) => <Skeleton className={cn("block rounded-2xl mb-4", height, width, className)} />;

export default SkeletonCard;
