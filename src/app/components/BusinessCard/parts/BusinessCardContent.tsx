"use client";

import { m } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { useIsDesktop } from "@/app/hooks/useIsDesktop";
import BusinessCardCategory from "./BusinessCardCategory";
import BusinessCardReviews from "./BusinessCardReviews";
import BusinessCardPercentiles from "./BusinessCardPercentiles";

interface BusinessCardContentProps {
  business: {
    id: string;
    name: string;
    percentiles?: {
      punctuality?: number;
      "cost-effectiveness"?: number;
      friendliness?: number;
      trustworthiness?: number;
    };
    status?: string;
  };
  displayCategoryLabel: string;
  categoryKey: string;
  hasRating: boolean;
  displayRating: number | undefined;
  totalReviews: number;
  hasReviewed: boolean;
  compact?: boolean;
  ownerView?: boolean;
  businessTitleLayoutId: string;
  onCardClick: (e: React.MouseEvent) => void;
  onWriteReview: (e: React.MouseEvent) => void;
  isBusinessAccount: boolean;
}

export default function BusinessCardContent({
  business,
  displayCategoryLabel,
  categoryKey,
  hasRating,
  displayRating,
  totalReviews,
  hasReviewed,
  compact = false,
  ownerView = false,
  businessTitleLayoutId,
  onCardClick,
  onWriteReview,
  isBusinessAccount,
}: BusinessCardContentProps) {
  const isDesktop = useIsDesktop();

  return (
    <div
      className={`px-4 pt-3 sm:px-4 sm:pt-2 md:pt-3 lg:pt-3 pb-3 ${
        compact ? "lg:py-1 lg:pt-2 lg:pb-0 lg:min-h-[160px]" : "flex-1"
      } relative flex-shrink-0 flex flex-col justify-start bg-card-bg/10 z-10 rounded-b-[12px]`}
    >
      <div className="flex flex-col">
        {/* Info Wrapper */}
        <div className="relative overflow-hidden">
          {/* Content - Centered */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-0.5">
            {/* Business Name */}
            <div className="flex items-center justify-center w-full min-w-0 relative">
              {isDesktop ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onCardClick}
                        className="group w-full max-w-full min-w-0 text-charcoal transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 rounded-lg px-2 py-1 flex items-center justify-center relative"
                        aria-label={`View ${business.name} details`}
                      >
                        <m.h3
                          layoutId={businessTitleLayoutId}
                          className="text-h2 sm:text-h1 font-bold text-center leading-[1.3] truncate tracking-tight transition-colors duration-300 group-hover:text-navbar-bg/90 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap relative z-[1]"
                        >
                          {business.name}
                        </m.h3>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{business.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <button
                  type="button"
                  onClick={onCardClick}
                  className="group w-full max-w-full min-w-0 text-charcoal transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 rounded-lg px-2 py-1 flex items-center justify-center relative"
                  aria-label={`View ${business.name} details`}
                >
                  <m.h3
                    layoutId={businessTitleLayoutId}
                    className="text-h2 sm:text-h1 font-bold text-center leading-[1.3] truncate tracking-tight transition-colors duration-300 group-hover:text-navbar-bg/90 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap relative z-[1]"
                  >
                    {business.name}
                  </m.h3>
                </button>
              )}
              {ownerView && (business as { status?: string }).status === "pending_approval" && (
                <span className="mt-1.5 inline-flex items-center rounded-full bg-off-white px-2.5 py-1 text-xs font-semibold text-charcoal">
                  Pending Approval
                </span>
              )}
            </div>

            {/* Category with icon */}
            <div className="flex flex-col items-center gap-1 w-full">
              <BusinessCardCategory
                category={displayCategoryLabel}
                subInterestId={categoryKey === "default" ? undefined : categoryKey}
                subInterestLabel={displayCategoryLabel}
                displayCategoryLabel={displayCategoryLabel}
              />
            </div>

            {/* Reviews */}
            <BusinessCardReviews
              hasRating={hasRating}
              displayRating={displayRating}
              reviews={totalReviews}
              hasReviewed={hasReviewed}
              onCardClick={onCardClick}
              onWriteReview={onWriteReview}
              compact={compact}
            />

            {/* Percentiles */}
            <BusinessCardPercentiles percentiles={business.percentiles} />
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex md:hidden items-center justify-center pt-1.5 pb-1.5 px-1">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-caption sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage/40 border transition-all duration-200 min-h-[48px] shadow-md bg-gradient-to-br from-navbar-bg to-navbar-bg/90 text-white border-sage/50 active:scale-95 active:translate-y-[1px] transform-gpu touch-manipulation select-none"
          onClick={onCardClick}
          aria-label={`View ${business.name} details`}
        >
          <span>{isBusinessAccount ? "View Business Profile" : "View Details"}</span>
        </button>
      </div>
    </div>
  );
}
