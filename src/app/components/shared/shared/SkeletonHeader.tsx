import React from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

interface SkeletonHeaderProps {
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({
  className = "",
  height = "h-8",
  width = "w-2/3",
}) => <Skeleton className={cn("block rounded-lg mb-2", height, width, className)} />;

export default SkeletonHeader;
