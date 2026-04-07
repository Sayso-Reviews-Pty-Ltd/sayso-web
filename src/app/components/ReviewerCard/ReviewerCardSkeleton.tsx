"use client";

import React from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

/**
 * Skeleton for ReviewerCard (variant="reviewer").
 * Structure matches the redesigned card exactly to prevent layout shift.
 */
export default function ReviewerCardSkeleton() {
  return (
    <div
      className="snap-center snap-always w-full sm:w-[220px] md:w-[300px] flex-shrink-0"
      aria-hidden
    >
      <div className="relative bg-card-bg rounded-[12px] overflow-hidden shadow-md border-none">
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-10 h-10 rounded-full bg-charcoal/8 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <Skeleton className="h-3.5 w-24 bg-charcoal/8 rounded-md" />
              <Skeleton className="h-2.5 w-14 bg-charcoal/5 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center px-1.5 py-1.5 rounded-full bg-off-white/60 border border-charcoal/[0.06] gap-0.5"
              >
                <Skeleton className="h-5 w-7 bg-charcoal/8 rounded-md" />
                <Skeleton className="h-2 w-8 bg-charcoal/5 rounded-md" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-14 bg-charcoal/8 rounded-full" />
            <Skeleton className="h-4 w-12 bg-charcoal/8 rounded-full" />
          </div>

          <div className="rounded-xl px-2.5 py-2 bg-off-white/50 border border-charcoal/[0.06] space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-2.5 h-2.5 rounded-sm bg-coral/20" />
                ))}
              </div>
              <Skeleton className="h-2 w-8 bg-charcoal/5 rounded" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-full bg-charcoal/5 rounded" />
              <Skeleton className="h-2.5 w-4/5 bg-charcoal/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
