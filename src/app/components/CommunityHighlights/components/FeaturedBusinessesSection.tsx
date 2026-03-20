"use client";

import { m } from "framer-motion";
import { ArrowRight } from "@/app/lib/icons";
import ScrollableSection from "../../ScrollableSection/ScrollableSection";
import LocationPromptBanner from "../../Location/LocationPromptBanner";
import BusinessOfTheMonthCard from "../../BusinessCard/BusinessOfTheMonthCard";
import type { BusinessOfTheMonth } from "../../../types/community";
import { containerVariants, itemVariants } from "../communityHighlights.constants";

interface FeaturedBusinessesSectionProps {
  hasBusinesses: boolean;
  businessesOfTheMonth?: BusinessOfTheMonth[];
  hasCoordinateBusinesses: boolean;
  hideCarouselArrowsOnDesktop: boolean;
  disableAnimations: boolean;
  isDesktop: boolean;
  loopFeaturedRail?: boolean;
  onSeeMoreBusinesses: () => void;
}

export default function FeaturedBusinessesSection({
  hasBusinesses,
  businessesOfTheMonth,
  hasCoordinateBusinesses,
  hideCarouselArrowsOnDesktop,
  disableAnimations,
  isDesktop,
  loopFeaturedRail = false,
  onSeeMoreBusinesses,
}: FeaturedBusinessesSectionProps) {
  if (hasBusinesses) {
    return (
      <section
        className="relative m-0 pt-2 w-full mt-3 list-none"
        aria-label="Featured Businesses of the Month by Category"
        style={{
          fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        }}
      >
        <LocationPromptBanner hasCoordinateBusinesses={hasCoordinateBusinesses} />
        <div className="mx-auto w-full max-w-[2000px] relative z-10">
          <div className="pb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
              <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                <span className="sm:hidden">Featured Businesses</span>
                <span className="hidden sm:inline">Featured Businesses of the Month by Category</span>
              </span>
            </div>
            <button
              onClick={onSeeMoreBusinesses}
              className="group inline-flex items-center gap-1 text-body-sm sm:text-caption font-normal text-charcoal transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:text-sage focus:outline-none px-4 py-2 -mx-2 relative no-underline motion-reduce:transition-none"
              aria-label="See More: Featured Businesses"
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 400 }}
            >
              <span className="relative z-10 transition-[color,transform] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-charcoal group-hover:text-sage group-hover:translate-x-[-1px] no-underline motion-reduce:transition-none" style={{ fontWeight: 400 }}>
                See More
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-[3px] text-charcoal group-hover:text-sage motion-reduce:transition-none" />
            </button>
          </div>

          <ScrollableSection enableMobilePeek hideArrowsOnDesktop={hideCarouselArrowsOnDesktop} loop={loopFeaturedRail}>
            {/* Gap harmonizes with card radius/shadows; list semantics preserved via <li> inside cards */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media (max-width: 639px) {
                .business-month-card-full-width > li {
                  width: 100% !important;
                  max-width: 100% !important;
                }
              }
            `}} />
            {isDesktop ? (
              disableAnimations ? (
                <div className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch pt-2 list-none">
                  {(Array.isArray(businessesOfTheMonth) ? businessesOfTheMonth : []).map((business, index) => (
                    <div
                      key={business.id}
                      className="snap-start snap-always flex-shrink-0 w-[calc(100vw-80px)] sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center business-month-card-full-width"
                    >
                      <BusinessOfTheMonthCard
                        business={business}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <m.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch pt-2 list-none"
                >
                  {(Array.isArray(businessesOfTheMonth) ? businessesOfTheMonth : []).map((business, index) => (
                    <m.div
                      key={business.id}
                      variants={itemVariants}
                      className="snap-start snap-always flex-shrink-0 w-[calc(100vw-80px)] sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center business-month-card-full-width"
                    >
                      <BusinessOfTheMonthCard
                        business={business}
                        index={index}
                      />
                    </m.div>
                  ))}
                </m.div>
              )
            ) : (
              <div className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2 items-stretch pt-2 list-none">
                {(Array.isArray(businessesOfTheMonth) ? businessesOfTheMonth : []).map((business, index) => (
                  <div key={business.id} className="snap-start snap-always flex-shrink-0 w-[calc(100vw-80px)] sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center business-month-card-full-width">
                    <BusinessOfTheMonthCard
                      business={business}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollableSection>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative m-0 p-0 w-full mt-3 list-none"
      aria-label="Featured Businesses"
      style={{
        fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-[2000px] relative z-10">
        <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
            <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
              <span className="sm:hidden">Featured</span>
              <span className="hidden sm:inline">Featured Businesses</span>
            </span>
          </div>
        </div>

        <div className="w-full bg-off-white border border-sage/20 rounded-3xl px-6 py-16 text-center space-y-3">
          <h2 className="text-h2 font-semibold text-charcoal" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Curated by trust and completeness.
          </h2>
          <p className="text-body-sm text-charcoal/60 max-w-[70ch] mx-auto" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
            As the community grows, this will highlight rising businesses. For now, we’ll feature verified, well-profiled places worth exploring.
          </p>
        </div>
      </div>
    </section>
  );
}
