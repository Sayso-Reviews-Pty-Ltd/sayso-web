"use client";

import { Skeleton } from "@/app/components/ui/skeleton";

const cardClass =
  "bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md";

export default function ReviewerProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-off-white relative overflow-hidden font-urbanist">
      <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />

      <div className="min-h-[100dvh] bg-gradient-to-b from-off-white/0 via-off-white/50 to-off-white relative z-10">
        <main role="main" aria-label="Loading reviewer profile" aria-busy="true">
          <div className="mx-auto w-full max-w-[2000px] px-2 sm:px-4 lg:px-6 2xl:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="pb-1" aria-hidden="true">
              <ol className="flex items-center gap-2">
                <li>
                  <Skeleton className="h-4 w-10 bg-charcoal/10 rounded" />
                </li>
                <li>
                  <Skeleton className="h-4 w-4 bg-charcoal/10 rounded" />
                </li>
                <li>
                  <Skeleton className="h-4 w-28 bg-charcoal/10 rounded" />
                </li>
              </ol>
            </nav>

            <div className="pt-2 pb-12 sm:pb-16 md:pb-20">
              <div className="space-y-6">
                {/* ── Header card ── */}
                <article className={`${cardClass} relative overflow-hidden`} aria-hidden="true">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sage/10 to-transparent rounded-full blur-lg pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-coral/10 to-transparent rounded-full blur-lg pointer-events-none" />
                  <div className="relative z-10 p-6 sm:p-8">
                    {/* flex-col on mobile, flex-row on sm+ — matches ReviewerHeaderCard */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Avatar */}
                      <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex-shrink-0 bg-charcoal/10" />
                      {/* Info */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Name + badge pill */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Skeleton className="h-8 w-36 sm:h-9 sm:w-48 bg-charcoal/10 rounded" />
                          <Skeleton className="h-6 w-16 sm:w-20 bg-sage/10 rounded-full" />
                        </div>
                        {/* Location + member since */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <Skeleton className="h-4 w-24 sm:w-28 bg-charcoal/8 rounded" />
                          <Skeleton className="h-4 w-28 sm:w-36 bg-charcoal/8 rounded" />
                        </div>
                        {/* Rating + review count */}
                        <div className="flex items-center gap-6 flex-wrap">
                          <Skeleton className="h-6 w-12 sm:w-14 bg-coral/10 rounded" />
                          <Skeleton className="h-4 w-16 sm:w-20 bg-charcoal/8 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* ── Stats grid — 2 cols mobile, 4 cols sm+ ── */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`${cardClass} p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-8 w-8 rounded-full bg-charcoal/10 flex-shrink-0" />
                        <Skeleton className="h-3.5 w-12 sm:w-14 bg-charcoal/8 rounded" />
                      </div>
                      <Skeleton className="h-7 w-12 sm:w-16 bg-charcoal/10 rounded mb-1" />
                      <Skeleton className="h-3 w-20 sm:w-24 bg-charcoal/6 rounded" />
                    </div>
                  ))}
                </section>

                {/* ── Badges section — 2/3/4-col grid ── */}
                <section className={`${cardClass} p-6 sm:p-8`} aria-hidden="true">
                  {/* Header row: icon + title | See More — matches ReviewerBadgesSection */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full bg-charcoal/10 flex-shrink-0" />
                      <Skeleton className="h-4 w-40 sm:w-52 bg-charcoal/10 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-off-white/70 rounded-xl ring-1 ring-black/5 shadow-sm p-3 flex flex-col items-center text-center gap-1.5"
                      >
                        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-charcoal/10" />
                        <Skeleton className="h-2.5 w-16 sm:w-20 bg-charcoal/10 rounded" />
                        <Skeleton className="h-2.5 w-20 sm:w-24 bg-charcoal/6 rounded" />
                        <Skeleton className="h-2.5 w-14 sm:w-16 bg-charcoal/6 rounded" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Reviews section ── */}
                <section className={`${cardClass} p-6 sm:p-8`} aria-hidden="true">
                  <Skeleton className="h-5 w-36 sm:w-44 bg-charcoal/10 rounded mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-off-white/50 rounded-xl border border-charcoal/6 p-4"
                      >
                        {/* Business image + meta — stacks on mobile */}
                        <div className="flex flex-col sm:flex-row items-start gap-3 mb-3">
                          <Skeleton className="w-full h-10 sm:w-12 sm:h-12 rounded-xl bg-charcoal/10 flex-shrink-0" />
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1.5">
                              <Skeleton className="h-4 w-36 sm:w-40 bg-charcoal/10 rounded" />
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Skeleton
                                    key={s}
                                    className="w-3.5 h-3.5 bg-coral/20 rounded-sm"
                                  />
                                ))}
                              </div>
                            </div>
                            <Skeleton className="h-3 w-20 bg-charcoal/6 rounded mb-2" />
                            <Skeleton className="h-3 w-full bg-charcoal/6 rounded mb-1" />
                            <Skeleton className="h-3 w-full bg-charcoal/6 rounded mb-1" />
                            <Skeleton className="h-3 w-3/4 bg-charcoal/6 rounded" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-16 bg-charcoal/6 rounded" />
                          <Skeleton className="h-6 w-14 bg-sage/10 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
