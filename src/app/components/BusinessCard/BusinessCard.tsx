"use client";

import React, { memo } from "react";
import Link from "next/link";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import BusinessCardImage from "./parts/BusinessCardImage";
import BusinessCardActions from "./parts/BusinessCardActions";
import BusinessCardStarBadge from "./parts/BusinessCardStarBadge";
import BusinessCardDistanceBadge from "./parts/BusinessCardDistanceBadge";
import BusinessCardContent from "./parts/BusinessCardContent";
import { useBusinessCardController } from "./hooks/useBusinessCardController";
import type { Business, Percentiles } from "./BusinessCard.types";
import { RAIL_CARD_MEDIA_HEIGHT, RAIL_CARD_RADIUS, RAIL_CARD_WIDTH } from "../HomeSectionRow/cardDimensions";

export type { Business, Percentiles };

function BusinessCard({
  business,
  hideStar = false,
  compact = false,
  index = 0,
  ownerView = false,
  showActions: showActionsProp,
}: {
  business: Business;
  hideStar?: boolean;
  compact?: boolean;
  inGrid?: boolean;
  index?: number;
  ownerView?: boolean;
  showActions?: boolean;
}) {
  const controller = useBusinessCardController({
    business,
    ownerView,
    index,
    showActionsProp,
  });

  const mediaBaseClass =
    "relative overflow-hidden z-10 cursor-pointer bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl";
  const mediaClass = `${mediaBaseClass} ${RAIL_CARD_MEDIA_HEIGHT}`;

  return (
    <div
      id={controller.idForSnap}
      className={`snap-center snap-always flex-shrink-0 h-full ${compact ? "w-auto" : RAIL_CARD_WIDTH}`}
      style={{
        fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        fontWeight: 600,
      }}
    >
      <Link
        href={controller.businessProfileRoute}
        prefetch={false}
        className={`${RAIL_CARD_RADIUS} ${compact ? "lg:min-h-[200px]" : "h-full"} relative flex-shrink-0 flex flex-col justify-between bg-card-bg z-10 shadow-md group cursor-pointer w-full overflow-hidden`}
        style={{ maxWidth: compact ? "100%" : "540px" } as React.CSSProperties}
        onMouseEnter={controller.handleMouseEnter}
        onMouseLeave={controller.handleMouseLeave}
        onTouchStart={controller.handleTouchStart}
      >
        <div className={mediaClass}>
          <BusinessCardImage
            displayImage={controller.displayImage}
            isImagePng={controller.isImagePng}
            displayAlt={controller.displayAlt}
            usingFallback={controller.usingFallback}
            imgError={controller.imgError}
            onImageError={controller.handleImageError}
            categoryKey={controller.categoryKey}
            businessName={business.name}
            verified={business.verified}
            sharedLayoutId={controller.businessImageLayoutId}
            priority={index < 3}
          />

          {business.verified && (
            <div className="absolute left-4 top-4 z-20">
              <VerifiedBadge />
            </div>
          )}

          <BusinessCardStarBadge
            displayRating={controller.displayRating}
            hideStar={hideStar}
            hasRating={controller.hasRating}
            index={index}
            businessId={business.id}
          />

          <BusinessCardDistanceBadge
            distanceBadgeText={controller.distanceBadgeText}
            distanceHint={controller.distanceHint}
          />

          {controller.showActions && (
            <BusinessCardActions
              hasReviewed={controller.hasReviewed}
              isItemSaved={controller.isItemSaved}
              isBusinessAccount={controller.isBusinessAccount}
              onWriteReview={controller.onWriteReviewClick}
              onViewProfile={controller.onCardClick}
              onBookmark={controller.onBookmarkClick}
              onShare={controller.onShareClick}
              businessName={business.name}
            />
          )}
        </div>

        <BusinessCardContent
          business={business}
          displayCategoryLabel={controller.displayCategoryLabel}
          categoryKey={controller.categoryKey}
          hasRating={controller.hasRating}
          displayRating={controller.displayRating}
          totalReviews={controller.totalReviews}
          hasReviewed={controller.hasReviewed}
          compact={compact}
          ownerView={ownerView}
          businessTitleLayoutId={controller.businessTitleLayoutId}
          onCardClick={controller.onCardClick}
          onWriteReview={controller.onWriteReviewClick}
          isBusinessAccount={controller.isBusinessAccount}
        />
      </Link>
    </div>
  );
}

export default memo(BusinessCard);
