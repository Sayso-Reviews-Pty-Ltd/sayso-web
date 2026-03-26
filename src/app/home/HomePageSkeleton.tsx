import BusinessRowSkeleton from "../components/BusinessRow/BusinessRowSkeleton";
import HeroSkeleton from "../components/Hero/HeroSkeleton";
import MobileHeroSkeleton from "../components/Hero/MobileHeroSkeleton";
import EventsSpecialsSkeleton from "../components/EventsSpecials/EventsSpecialsSkeleton";
import CommunityHighlightsSkeleton from "../components/CommunityHighlights/CommunityHighlightsSkeleton";

/**
 * Skeleton for PPR Suspense boundary - shown while HomeClient loads.
 */
export default function HomePageSkeleton() {
  return (
    <div className="min-h-dvh flex flex-col bg-off-white">
      <div className="overflow-hidden">
        <div className="hidden sm:block">
          <HeroSkeleton />
        </div>
        <div className="sm:hidden">
          <MobileHeroSkeleton />
        </div>
      </div>
      <main className="relative min-h-dvh pt-8 sm:pt-10 md:pt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />
        <div className="relative mx-auto w-full max-w-[2000px]">
          <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 pt-0">
            <BusinessRowSkeleton title="For You Now" />
            <BusinessRowSkeleton title="Trending Now" cards={4} />
            <EventsSpecialsSkeleton
              title="Events & Specials"
              containerClass="mx-auto w-full max-w-[2000px] relative z-10"
              showHeaderCta
              enableMobilePeek
            />
            <CommunityHighlightsSkeleton reviewerCount={12} businessCount={4} />
          </div>
        </div>
      </main>
    </div>
  );
}
