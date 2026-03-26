"use client";

import Image from "next/image";
import { Image as ImageIcon } from "@/app/lib/icons";
import { AnimatePresence, m } from "framer-motion";
import VerifiedBadge from "../../VerifiedBadge/VerifiedBadge";
import { getSubcategoryPlaceholderFromCandidates } from "../../../utils/subcategoryPlaceholders";
import { BLUR_DATA_URL } from "../BusinessOfTheMonthCard.constants";
import { RAIL_CARD_MEDIA_HEIGHT, RAIL_CARD_RADIUS } from "../../HomeSectionRow/cardDimensions";

interface BusinessOfTheMonthCardMediaProps {
  displayImage: string;
  isPlaceholder: boolean;
  displayAlt: string;
  imgError: boolean;
  usingFallback: boolean;
  index: number;
  onImageError: () => void;
  business: any;
  verified?: boolean;
  hasReviews: boolean;
  displayTotal: number;
  starGradientId: string | null;
  activeOverlayBadge: {
    key: string;
    label: string;
    title: string;
    ariaLabel: string;
  } | null;
  badgeTransition: {
    duration: number;
    ease: "easeOut" | "easeIn" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate";
  };
  canSwitchBadges: boolean;
  isMediaHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCardClick: () => void;
  onWriteReview: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

export default function BusinessOfTheMonthCardMedia({
  displayImage,
  isPlaceholder,
  displayAlt,
  imgError,
  usingFallback,
  index,
  onImageError,
  business,
  verified,
  hasReviews,
  displayTotal,
  starGradientId,
  activeOverlayBadge,
  badgeTransition,
  canSwitchBadges,
  isMediaHovered,
  onMouseEnter,
  onMouseLeave,
  onCardClick,
  onWriteReview,
  onBookmark,
  onShare,
}: BusinessOfTheMonthCardMediaProps) {
  const isSaved = business.isSaved;

  return (
    <>
      {/* SVG Gradient Definitions for Star Icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="starGradientGoldBOTM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F5D547', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#E6A547', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="starGradientBronzeBOTM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4915C', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#8B6439', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="starGradientLowBOTM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D66B6B', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6B5C5C', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* MEDIA - Full bleed with premium overlay */}
      <div
        className={`relative isolate overflow-hidden z-10 cursor-pointer ${RAIL_CARD_MEDIA_HEIGHT} ${RAIL_CARD_RADIUS} rounded-b-none`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onCardClick}
      >
        <div className="relative w-full h-full">
          {!imgError && displayImage ? (
            <div className="relative w-full h-full overflow-hidden shadow-sm">
              <Image
                src={usingFallback ? getSubcategoryPlaceholderFromCandidates([
                  (business as any).sub_interest_id,
                  (business as any).subInterestId,
                  (business as any).sub_interest_slug,
                  (business as any).interest_id,
                  (business as any).interestId,
                ]) : displayImage}
                alt={displayAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 340px"
                className="object-cover card-img-zoom sm:group-active:scale-[0.98] motion-reduce:transition-none"
                priority={index < 2}
                loading={index < 2 ? "eager" : "lazy"}
                fetchPriority={index < 2 ? "high" : "auto"}
                quality={index < 2 ? 85 : 80}
                style={{ aspectRatio: '4/3' }}
                onError={onImageError}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
              <div
                className="absolute inset-0 pointer-events-none card-overlay-fade motion-reduce:transition-none"
                style={{ background: "hsla(0, 0%, 0%, 0.2)" }}
                aria-hidden="true"
              />
            </div>
          ) : (
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ backgroundColor: '#E5E0E5' }}
            >
              <ImageIcon className="w-16 h-16 text-charcoal/20" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Premium glass badges */}
        {verified && (
          <div className="absolute left-4 top-4 z-20">
            <VerifiedBadge />
          </div>
        )}

        {/* Single overlay badge: smoothly switches between Sayso Select and distance */}
        {activeOverlayBadge && (
          <div className="absolute left-3 bottom-3 z-20 w-[calc(100%-1.5rem)] max-w-[230px] sm:max-w-[250px]">
            <div className="relative h-[30px] overflow-hidden rounded-full bg-off-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={activeOverlayBadge.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={badgeTransition as any}
                  className="absolute inset-0 flex items-center px-2.5"
                  aria-label={activeOverlayBadge.ariaLabel}
                  title={activeOverlayBadge.title}
                >
                  <span
                    className="truncate text-[11px] font-medium leading-none text-charcoal"
                    style={{
                      fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    {activeOverlayBadge.label}
                  </span>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Star rating badge */}
        {hasReviews && displayTotal > 0 ? (
          <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-3 py-1.5 text-charcoal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-full p-1" aria-hidden>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={`url(#starGradient${starGradientId}BOTM)`} stroke={`url(#starGradient${starGradientId}BOTM)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-charcoal" style={{
              fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontWeight: 600
            }}>
              {Number(displayTotal).toFixed(1)}
            </span>
          </div>
        ) : (
          <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-3 py-1.5 text-charcoal shadow-md">
            <span className="text-sm font-semibold text-charcoal" style={{
              fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontWeight: 600
            }}>
              New
            </span>
          </div>
        )}

        {/* Premium floating actions - desktop only */}
        <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2 transition-all duration-300 ease-out translate-x-12 opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
          <button
            className="w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md transform-gpu touch-manipulation select-none"
            onClick={(e) => {
              e.stopPropagation();
              onWriteReview(e);
            }}
            aria-label={`Write a review for ${business.name}`}
            title="Write a review"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/80">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md transform-gpu touch-manipulation select-none"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(e);
            }}
            aria-label={`${isSaved ? 'Remove from saved' : 'Save'} ${business.name}`}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/80">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md transform-gpu touch-manipulation select-none"
            onClick={(e) => {
              e.stopPropagation();
              onShare(e);
            }}
            aria-label={`Share ${business.name}`}
            title="Share"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/80">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
