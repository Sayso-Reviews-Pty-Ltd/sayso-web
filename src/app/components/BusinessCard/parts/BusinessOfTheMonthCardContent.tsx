"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { useIsDesktop } from "@/app/hooks/useIsDesktop";
import Stars from "../../Stars/Stars";
import { getCategoryIcon } from "../BusinessOfTheMonthCard.constants";
import { getCategoryLabelFromBusiness } from "../../../utils/subcategoryPlaceholders";

interface BusinessOfTheMonthCardContentProps {
  business: {
    id: string;
    name: string;
    reviewCount: number;
  };
  hasReviews: boolean;
  onCardClick: () => void;
  onWriteReview: (e: React.MouseEvent) => void;
  displayTotal: number;
  isSaved: boolean;
  onBookmark: (e: React.MouseEvent) => void;
}

export default function BusinessOfTheMonthCardContent({
  business,
  hasReviews,
  onCardClick,
  onWriteReview,
  displayTotal,
  isSaved,
  onBookmark,
}: BusinessOfTheMonthCardContentProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className="px-5 pt-2.5 sm:px-6 sm:pt-1 md:pt-2 lg:pt-2.5 pb-2.5 flex-1 relative flex-shrink-0 flex flex-col justify-start bg-card-bg/10 z-10 rounded-b-[12px]">
      <div className="flex flex-col">
        {/* Info Wrapper */}
        <div className="relative overflow-hidden">
          {/* Content - Centered */}
          <div className="flex flex-col items-center text-center relative z-10 space-y-0.5">
            {/* Business Name */}
            <div className="flex items-center justify-center w-full min-w-0">
              {isDesktop ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onCardClick}
                        className="group w-full max-w-full min-w-0 text-charcoal transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 rounded-lg px-2 py-1 flex items-center justify-center"
                        aria-label={`View ${business.name} details`}
                      >
                        <h3 className="text-h2 sm:text-h1 font-bold text-inherit text-center leading-[1.3] truncate tracking-tight transition-colors duration-300 group-hover:text-navbar-bg/90 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {business.name}
                        </h3>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{business.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <button
                  type="button"
                  onClick={onCardClick}
                  className="group w-full max-w-full min-w-0 text-charcoal transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 rounded-lg px-2 py-1 flex items-center justify-center"
                  aria-label={`View ${business.name} details`}
                >
                  <h3 className="text-h2 sm:text-h1 font-bold text-inherit text-center leading-[1.3] truncate tracking-tight transition-colors duration-300 group-hover:text-navbar-bg/90 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {business.name}
                  </h3>
                </button>
              )}
            </div>

            {/* Category with icon */}
            <div className="flex flex-col items-center gap-1 w-full">
              {(() => {
                const categoryLabel = getCategoryLabelFromBusiness(business as any);
                const CategoryIcon = getCategoryIcon(categoryLabel);
                return (
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-off-white/20 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-4 h-4 text-charcoal/70" strokeWidth={2.5} />
                    </div>
                    <span className="truncate text-caption sm:text-xs text-charcoal/80 font-semibold">
                      {categoryLabel}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Reviews */}
            <div className="flex flex-col items-center gap-1 mb-1">
              <div className="inline-flex items-center justify-center gap-1 min-h-[12px]">
                {hasReviews ? (
                  <>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCardClick();
                        }
                      }}
                      className="inline-flex items-center justify-center text-body-sm sm:text-base font-bold leading-none text-navbar-bg underline-offset-2 cursor-pointer transition-colors duration-200 hover:text-coral"
                    >
                      {business.reviewCount}
                    </span>
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCardClick();
                        }
                      }}
                      className="inline-flex items-center justify-center text-sm leading-none text-navbar-bg underline-offset-2 cursor-pointer transition-colors duration-200 hover:text-coral"
                    >
                      Reviews
                    </span>
                  </>
                ) : (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWriteReview(e);
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onWriteReview(e as any);
                      }
                    }}
                    className="inline-flex items-center justify-center text-sm font-normal underline-offset-2 min-w-[92px] text-center transition-colors duration-200 text-charcoal cursor-pointer hover:text-coral"
                    title="Be the first to review"
                  >
                    Be the first to review
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-center gap-2 text-charcoal transition-all duration-300"
                aria-label={
                  hasReviews
                    ? `View ${business.reviewCount} reviews for ${business.name}`
                    : `Be the first to review ${business.name}`
                }
              >
                <Stars
                  value={hasReviews && displayTotal > 0 ? displayTotal : 0}
                  color="charcoal"
                  size={18}
                  spacing={2.5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex md:hidden items-center justify-center pt-1.5 px-1 border-t border-off-white/30">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-caption sm:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage/40 border transition-all duration-200 min-h-[48px] bg-gradient-to-br from-navbar-bg to-navbar-bg/90 text-white border-sage/50 active:scale-95 active:translate-y-[1px] shadow-md transform-gpu touch-manipulation select-none"
          onClick={(e) => {
            e.stopPropagation();
            onWriteReview(e);
          }}
          aria-label={`Write a review for ${business.name}`}
        >
          <span>Review</span>
        </button>
      </div>
    </div>
  );
}
