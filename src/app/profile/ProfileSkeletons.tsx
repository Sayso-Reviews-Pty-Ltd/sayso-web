"use client";

import { Skeleton } from "@/app/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <article className="w-full sm:mx-0">
      <div className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sage/10 to-transparent rounded-full blur-lg"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-coral/10 to-transparent rounded-full blur-lg"></div>
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-card-bg/20 flex-shrink-0" />
            <div className="flex-1 min-w-0 w-full space-y-4">
              <Skeleton className="h-8 bg-white/30 rounded-lg w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 bg-white/20 rounded w-full max-w-md" />
                <Skeleton className="h-4 bg-white/20 rounded w-3/4 max-w-sm" />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Skeleton className="h-4 bg-white/20 rounded w-28" />
                <Skeleton className="h-4 bg-white/20 rounded w-36" />
              </div>
              <Skeleton className="h-10 bg-coral/20 rounded-full w-32" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function StatsGridSkeleton() {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-5 h-5 bg-card-bg/20 rounded" />
            <Skeleton className="h-4 bg-white/20 rounded w-20" />
          </div>
          <Skeleton className="h-8 bg-white/30 rounded w-12 mb-1" />
          <Skeleton className="h-3 bg-white/20 rounded w-16" />
        </div>
      ))}
    </section>
  );
}

export function AchievementsSkeleton() {
  return (
    <section className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 bg-card-bg/20 rounded-full" />
        <Skeleton className="h-5 bg-white/30 rounded w-40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center p-4 bg-white/50 rounded-[16px] border-none"
          >
            <Skeleton className="w-12 h-12 bg-card-bg/20 rounded-full mb-3" />
            <Skeleton className="h-4 bg-white/30 rounded w-20 mb-2" />
            <Skeleton className="h-3 bg-white/20 rounded w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 bg-card-bg/20 rounded-full" />
        <Skeleton className="h-5 bg-white/30 rounded w-40" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-white/50 rounded-[16px] border-none">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-[12px] bg-card-bg/20 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 bg-white/30 rounded w-32" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Skeleton key={s} className="w-4 h-4 bg-white/20 rounded" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 bg-white/20 rounded w-full" />
                  <Skeleton className="h-3 bg-white/20 rounded w-3/4" />
                </div>
                <Skeleton className="h-3 bg-white/20 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
