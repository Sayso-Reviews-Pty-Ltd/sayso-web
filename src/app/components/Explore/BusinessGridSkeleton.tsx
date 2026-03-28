"use client";

import { Skeleton } from "@/app/components/ui/skeleton";

export default function BusinessGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="list-none">
          <div className="px-1 pt-1 pb-0 rounded-[12px] relative flex-shrink-0 flex flex-col justify-between bg-card-bg z-10 shadow-md w-full sm:h-auto animate-pulse">
            <div className="relative overflow-hidden z-10 rounded-t-[12px] bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 h-[280px] sm:h-[300px] md:h-[220px]">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-off-white/95 to-off-white/85">
                <Skeleton className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-charcoal/10 rounded-lg" />
              </div>

              <div className="absolute left-4 top-4 z-20">
                <Skeleton className="h-6 w-6 bg-card-bg/30 rounded-full" />
              </div>

              <div className="absolute right-4 top-4 z-20">
                <Skeleton className="h-7 w-14 bg-off-white/80 rounded-full" />
              </div>

              <Skeleton className="md:hidden absolute left-4 bottom-4 z-20 h-10 w-10 rounded-full bg-navbar-bg/30" />
            </div>

            <div className="px-3 sm:px-5 pt-2 sm:pt-1 md:pt-2 lg:pt-3 pb-2 sm:pb-0 relative flex-shrink-0 flex flex-col md:justify-start justify-between bg-card-bg/10 z-10 rounded-b-[12px]">
              <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                <Skeleton className="h-5 sm:h-7 w-3/4 bg-charcoal/10 rounded-lg" />

                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-off-white/20" />
                  <Skeleton className="h-3.5 sm:h-4 w-20 bg-charcoal/10 rounded" />
                </div>

                <Skeleton className="h-3 w-2/3 bg-charcoal/5 rounded" />

                <div className="flex items-center justify-center gap-3 flex-nowrap py-1 overflow-hidden w-[90%] mx-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-5 sm:h-6 w-10 sm:w-12 bg-off-white/20 rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="flex md:hidden items-center justify-center pt-2 pb-1">
                <Skeleton className="flex-1 h-10 sm:h-12 bg-charcoal/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
