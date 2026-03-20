"use client";

import BusinessGridSkeleton from "../../components/Explore/BusinessGridSkeleton";

export function ForYouGridLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] bg-off-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="mx-auto w-full max-w-[2000px] px-2 py-6 sm:py-8 md:py-10">
        <BusinessGridSkeleton />
      </div>
    </div>
  );
}
