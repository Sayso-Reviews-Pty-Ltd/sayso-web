import React from "react";
import { cn } from "@/app/lib/utils";
import { Skeleton } from "@/app/components/ui/skeleton";

function SkeletonBlock({
  className,
  rounded = "rounded-full",
}: {
  className: string;
  rounded?: string;
}) {
  return <Skeleton className={cn("bg-charcoal/10", rounded, className)} />;
}

function SkeletonCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-4 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default function BusinessReviewPageSkeleton() {
  return (
    <div className="min-h-dvh bg-off-white relative overflow-x-hidden font-urbanist">
      <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-[2000px] px-2">
        {/* Breadcrumb */}
        <nav className="pb-1">
          <div className="flex items-center gap-2 pt-1">
            <SkeletonBlock className="h-3.5 sm:h-4 w-32 sm:w-40" />
            <SkeletonBlock className="h-3 w-3 rounded-md" rounded="rounded-md" />
            <SkeletonBlock className="h-3.5 sm:h-4 w-24 sm:w-28" />
          </div>
        </nav>

        <div className="pt-2 pb-12 sm:pb-16 md:pb-20">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image carousel placeholder */}
              <SkeletonBlock className="h-48 w-full rounded-lg" rounded="rounded-lg" />

              {/* Review form */}
              <SkeletonCard className="space-y-5">
                {/* Star rating */}
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-28 rounded-xl" rounded="rounded-xl" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <SkeletonBlock key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-20 rounded-xl" rounded="rounded-xl" />
                  <div className="flex flex-wrap gap-2">
                    {["w-20", "w-24", "w-[72px]", "w-26", "w-22", "w-16", "w-24"].map((w, i) => (
                      <SkeletonBlock key={i} className={`h-8 ${w} rounded-full`} />
                    ))}
                  </div>
                </div>

                {/* Title input */}
                <SkeletonBlock className="h-11 w-full rounded-xl" rounded="rounded-xl" />

                {/* Text area */}
                <SkeletonBlock className="h-28 w-full rounded-xl" rounded="rounded-xl" />

                {/* Submit */}
                <SkeletonBlock className="h-12 w-full rounded-full bg-coral/20" />
              </SkeletonCard>
            </div>

            {/* Sidebar — desktop only */}
            <div className="hidden lg:block space-y-6">
              <SkeletonCard className="space-y-4">
                {/* Business name */}
                <SkeletonBlock className="h-5 w-36 rounded-xl" rounded="rounded-xl" />
                {/* Image */}
                <SkeletonBlock className="h-36 w-full rounded-lg" rounded="rounded-lg" />
                {/* Meta rows */}
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <SkeletonBlock className="h-4 w-4 rounded-md" rounded="rounded-md" />
                      <SkeletonBlock className="h-3.5 flex-1 rounded-xl" rounded="rounded-xl" />
                    </div>
                  ))}
                </div>
              </SkeletonCard>
            </div>
          </div>

          {/* What Others Are Saying */}
          <div className="pt-12 space-y-4">
            <SkeletonBlock className="h-8 w-56 sm:w-72 mx-auto rounded-2xl" rounded="rounded-2xl" />
            {[1, 2].map((i) => (
              <SkeletonCard key={i} className="space-y-3">
                <div className="flex items-start gap-3 sm:gap-4">
                  <SkeletonBlock className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0 bg-charcoal/12" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-24 sm:w-32" />
                    <SkeletonBlock className="h-3.5 w-full" />
                    <SkeletonBlock className="h-3.5 w-5/6" />
                    <SkeletonBlock className="h-3.5 w-2/3 bg-charcoal/8" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
