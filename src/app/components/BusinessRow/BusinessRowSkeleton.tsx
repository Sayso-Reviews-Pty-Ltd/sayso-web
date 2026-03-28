import ScrollableSection from "../ScrollableSection/ScrollableSection";
import { HOME_SECTION_CONTAINER_INSET_CLASS } from "../HomeSectionRow/homeSectionLayout";
import { Skeleton } from "@/app/components/ui/skeleton";

interface BusinessRowSkeletonProps {
  title: string;
  cards?: number;
}

const DEFAULT_CARD_COUNT = 5;
const MOBILE_PEEK_CARD_WIDTH = "w-[min(19.5rem,calc(100vw-3rem))]";

export default function BusinessRowSkeleton({
  title,
  cards = DEFAULT_CARD_COUNT,
}: BusinessRowSkeletonProps) {
  return (
    <section
      className="relative m-0 p-0 w-full"
      aria-label={`${title} loading`}
      aria-busy="true"
      style={{
        fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      <div
        className={`mx-auto w-full max-w-[2000px] relative z-10 ${HOME_SECTION_CONTAINER_INSET_CLASS}`}
      >
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-7 w-32 rounded-lg bg-charcoal/5" />
          <Skeleton className="h-8 w-24 rounded-full bg-charcoal/5" />
        </div>

        <ScrollableSection enableMobilePeek>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media (max-width: 639px) {
              .business-card-skeleton-full-width > div {
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `,
            }}
          />
          <div className="flex gap-2.5 sm:gap-3 items-stretch pt-2">
            {Array.from({ length: cards }).map((_, index) => (
              <div
                key={index}
                className={`snap-center snap-always flex-shrink-0 ${MOBILE_PEEK_CARD_WIDTH} sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex business-card-skeleton-full-width`}
              >
                <div className="px-1 pt-1 pb-0 rounded-[12px] relative flex-shrink-0 flex flex-col justify-between bg-card-bg z-10 shadow-md w-full sm:w-[260px] md:w-[340px]">
                  <div className="relative overflow-hidden z-10 rounded-t-[12px] bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl h-[280px] sm:h-[300px] md:h-[220px] animate-pulse">
                    {/* Verified badge skeleton */}
                    <Skeleton className="absolute left-4 top-4 z-20 h-6 w-6 rounded-full bg-card-bg/30" />
                    {/* Rating badge skeleton */}
                    <Skeleton className="absolute right-4 top-4 z-20 h-8 w-16 rounded-full bg-off-white/40" />
                    {/* Info button skeleton (mobile) */}
                    <Skeleton className="md:hidden absolute left-4 bottom-4 z-20 h-10 w-10 rounded-full bg-navbar-bg/30" />
                  </div>

                  <div className="px-3 sm:px-5 pt-2 sm:pt-1 md:pt-2 lg:pt-3 pb-2 sm:pb-0 flex-1 relative flex-shrink-0 flex flex-col md:justify-start justify-between bg-card-bg/10 z-10 rounded-b-[12px]">
                    <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-1">
                      <Skeleton className="h-5 sm:h-7 w-3/4 bg-charcoal/10 rounded-lg" />

                      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1">
                        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-off-white/20" />
                        <Skeleton className="h-3.5 sm:h-4 w-20 bg-charcoal/5 rounded" />
                      </div>

                      <Skeleton className="h-3 w-2/3 bg-charcoal/5 rounded" />

                      <div className="flex items-center justify-center gap-3 sm:gap-3 flex-nowrap py-1 overflow-hidden w-[90%] mx-auto">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-5 sm:h-6 w-10 sm:w-12 bg-off-white/20 rounded-full"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex md:hidden items-center justify-center pt-2 pb-1">
                      <Skeleton className="flex-1 h-10 sm:h-12 bg-navbar-bg/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollableSection>
      </div>
    </section>
  );
}
