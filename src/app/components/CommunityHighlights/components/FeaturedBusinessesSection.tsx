"use client";

import { ArrowRight } from "@/app/lib/icons";
import ScrollableSection from "../../ScrollableSection/ScrollableSection";
import LocationPromptBanner from "../../Location/LocationPromptBanner";
import BusinessOfTheMonthCard from "../../BusinessCard/BusinessOfTheMonthCard";
import type { BusinessOfTheMonth } from "../../../types/community";
import { HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS, HOME_SECTION_RAIL_CLASS } from "../../HomeSectionRow/homeSectionLayout";
import CardRail from "../../CardRail/CardRail";

interface FeaturedBusinessesSectionProps {
  hasBusinesses: boolean;
  businessesOfTheMonth?: BusinessOfTheMonth[];
  hasCoordinateBusinesses: boolean;
  hideCarouselArrowsOnDesktop: boolean;
  disableAnimations: boolean;
  onSeeMoreBusinesses: () => void;
}

export default function FeaturedBusinessesSection({
  hasBusinesses,
  businessesOfTheMonth,
  hasCoordinateBusinesses,
  hideCarouselArrowsOnDesktop,
  disableAnimations,
  onSeeMoreBusinesses,
}: FeaturedBusinessesSectionProps) {
  const businessRailCardClass = `snap-center snap-always flex-shrink-0 h-full ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto sm:min-w-[25%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[18%] 2xl:min-w-[16%] list-none flex justify-center business-month-card-full-width`;

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

        <ScrollableSection enableMobilePeek hideArrowsOnDesktop={hideCarouselArrowsOnDesktop} className={HOME_SECTION_RAIL_CLASS}>
          <CardRail
            items={Array.isArray(businessesOfTheMonth) ? businessesOfTheMonth : []}
            getKey={(b) => b.id}
            renderCard={(b, i) => <BusinessOfTheMonthCard business={b} index={i} />}
            cardClassName={businessRailCardClass}
            disableAnimations={disableAnimations}
            containerClassName="pt-2 list-none"
            mobileFullBleedClassName="business-month-card-full-width"
          />
        </ScrollableSection>
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
      <div className="pb-4 sm:pb-8 md:pb-10 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-sage/20 to-sage/10 border border-sage/30 mb-4">
          <span className="text-sm font-semibold text-sage" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
            <span className="sm:hidden">Featured</span>
            <span className="hidden sm:inline">Featured Businesses</span>
          </span>
        </div>
      </div>

      <div className="w-full bg-off-white border border-sage/20 rounded-[12px] px-6 py-16 text-center space-y-3">
        <h2 className="text-h2 font-semibold text-charcoal" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Curated by trust and completeness.
        </h2>
        <p className="text-body-sm text-charcoal/60 max-w-[70ch] mx-auto" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
          As the community grows, this will highlight rising businesses. For now, we'll feature verified, well-profiled places worth exploring.
        </p>
      </div>
    </section>
  );
}
