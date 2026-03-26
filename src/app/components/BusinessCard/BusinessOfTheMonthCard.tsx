"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { BusinessOfTheMonth } from "../../types/community";
import {
  getCategoryLabelFromBusiness,
  getSubcategoryPlaceholderFromCandidates,
  isPlaceholderImage,
} from "../../utils/subcategoryPlaceholders";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { useToast } from "../../contexts/ToastContext";
import {
  formatDistanceAway,
  isValidCoordinate,
  useBusinessDistanceLocation,
} from "../../hooks/useBusinessDistanceLocation";
import BusinessOfTheMonthCardMedia from "./parts/BusinessOfTheMonthCardMedia";
import BusinessOfTheMonthCardContent from "./parts/BusinessOfTheMonthCardContent";
import { BLUR_DATA_URL } from "./BusinessOfTheMonthCard.constants";
import { RAIL_CARD_RADIUS, RAIL_CARD_WIDTH } from "../HomeSectionRow/cardDimensions";

export default function BusinessOfTheMonthCard({ business, index = 0 }: { business: BusinessOfTheMonth; index?: number }) {
  const router = useRouter();
  const { toggleSavedItem, isItemSaved } = useSavedItems();
  const { showToast } = useToast();
  
  const idForSnap = useMemo(() => `business-month-${business.id}`, [business.id]);
  const [imgError, setImgError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isMediaHovered, setIsMediaHovered] = useState(false);
  const [showDistanceOnCycle, setShowDistanceOnCycle] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get business identifier for routing (slug or ID)
  const businessIdentifier = (business as any).slug || business.id;
  const normalizeRoute = (href: string) => {
    if (/^https?:\/\//i.test(href)) return href;
    return href.startsWith("/") ? href : `/${href}`;
  };
  const reviewRoute = `/business/${businessIdentifier}/review`;
  const businessProfileRoute = normalizeRoute((business as any).href || `/business/${businessIdentifier}`);
  const isInternalBusinessRoute = businessProfileRoute.startsWith("/");
  const isSaved = isItemSaved(business.id);

  const hasReviews = business.reviewCount > 0;
  const hasCoordinates = isValidCoordinate(business.lat) && isValidCoordinate(business.lng);
  const { status: locationStatus, getDistanceKm } = useBusinessDistanceLocation();
  const distanceLabel = useMemo(() => {
    if (!hasCoordinates) return null;
    const distanceKm = getDistanceKm(business.lat, business.lng);
    if (distanceKm === null) return null;
    return formatDistanceAway(distanceKm);
  }, [business.lat, business.lng, getDistanceKm, hasCoordinates]);
  const distanceHint = useMemo(() => {
    if (!hasCoordinates) return null;
    if (locationStatus === "loading") return "Calculating...";
    if (distanceLabel) return distanceLabel;
    if (locationStatus === "denied") {
      return "Location is off. Enable it in browser settings.";
    }
    return "Enable location to see distance";
  }, [distanceLabel, hasCoordinates, locationStatus]);
  const distanceBadgeText = useMemo(() => {
    if (!hasCoordinates) return null;
    if (distanceLabel) return distanceLabel;
    if (locationStatus === "loading") return "Calculating...";
    return null;
  }, [distanceLabel, hasCoordinates, locationStatus]);

  const ribbonText = useMemo(() => {
    const reasonLabel = (business as any).ui_hints?.reason?.label;
    const monthAchievement = (business as any).monthAchievement;
    const raw = reasonLabel || monthAchievement || business.badge || "";
    const categoryLabel = getCategoryLabelFromBusiness(business) || "our community";
    if (!raw || raw === "Featured" || raw === "Featured pick") {
      return `Sayso Select for ${categoryLabel}`;
    }
    if (/^Best\s+/i.test(raw)) {
      return raw.replace(/^Best\s+/i, "Sayso Select for ");
    }
    return raw;
  }, [(business as any).monthAchievement, (business as any).ui_hints?.reason?.label, business.badge, business]);

  const selectBadgeText = useMemo(() => {
    const normalized = ribbonText?.trim();
    return normalized || null;
  }, [ribbonText]);
  const distanceSwitchText = useMemo(() => {
    const normalized = distanceBadgeText?.trim();
    return normalized || null;
  }, [distanceBadgeText]);
  const distanceFallbackText = useMemo(() => {
    if (distanceSwitchText || selectBadgeText) return null;
    const normalizedHint = distanceHint?.trim();
    return normalizedHint || null;
  }, [distanceHint, distanceSwitchText, selectBadgeText]);
  const distanceDisplayText = distanceSwitchText || distanceFallbackText;
  const hasSelectBadge = Boolean(selectBadgeText);
  const hasDistanceBadge = Boolean(distanceDisplayText);
  const canSwitchBadges = Boolean(hasSelectBadge && distanceSwitchText);
  const shouldShowDistance = canSwitchBadges
    ? isMediaHovered || showDistanceOnCycle
    : !hasSelectBadge && hasDistanceBadge;
  const activeOverlayBadge = useMemo(() => {
    if (shouldShowDistance && distanceDisplayText) {
      return {
        key: "distance",
        label: distanceDisplayText,
        title: distanceHint ?? distanceDisplayText,
        ariaLabel: `Distance: ${distanceDisplayText}`,
      };
    }
    if (hasSelectBadge && selectBadgeText) {
      return {
        key: "select",
        label: selectBadgeText,
        title: `${selectBadgeText} - ${business.badge}`,
        ariaLabel: selectBadgeText,
      };
    }
    if (distanceDisplayText) {
      return {
        key: "distance-fallback",
        label: distanceDisplayText,
        title: distanceHint ?? distanceDisplayText,
        ariaLabel: `Distance: ${distanceDisplayText}`,
      };
    }
    return null;
  }, [
    business.badge,
    distanceDisplayText,
    distanceHint,
    hasSelectBadge,
    selectBadgeText,
    shouldShowDistance,
  ]);
  const badgeTransition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0.18 : 0.22,
      ease: "easeOut" as const,
    }),
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (!canSwitchBadges) {
      setShowDistanceOnCycle(false);
      return;
    }
    setShowDistanceOnCycle(false);
    const firstSwapDelayMs = 2800;
    const cycleIntervalMs = 5600;
    let cycleTimer: number | null = null;
    const firstSwapTimer = window.setTimeout(() => {
      setShowDistanceOnCycle(true);
      cycleTimer = window.setInterval(() => {
        setShowDistanceOnCycle((previous) => !previous);
      }, cycleIntervalMs);
    }, firstSwapDelayMs);

    return () => {
      window.clearTimeout(firstSwapTimer);
      if (cycleTimer !== null) {
        window.clearInterval(cycleTimer);
      }
    };
  }, [business.id, canSwitchBadges]);

  // Image fallback logic with edge case handling
  const getDisplayImage = useMemo(() => {
    // Priority 1: Check business_images array with is_primary flag (most explicit)
    const businessImages = (business as any).business_images;
    if (businessImages && Array.isArray(businessImages) && businessImages.length > 0) {
      // First try to find image explicitly marked as primary
      const primaryImage = businessImages.find((img: any) => img?.is_primary === true);
      const imageUrl = primaryImage?.url || businessImages[0]?.url;

      if (imageUrl &&
          typeof imageUrl === 'string' &&
          imageUrl.trim() !== '' &&
          !isPlaceholderImage(imageUrl)) {
        return { image: imageUrl, isPlaceholder: false };
      }
    }

    // Priority 2: Check uploaded_images array (backward compatibility, pre-sorted by is_primary DESC)
    const uploadedImages = (business as any).uploaded_images;
    if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
      const firstImage = uploadedImages[0]; // First image is primary due to ORDER BY is_primary DESC
      if (firstImage &&
          typeof firstImage === 'string' &&
          firstImage.trim() !== '' &&
          !isPlaceholderImage(firstImage)) {
        return { image: firstImage, isPlaceholder: false };
      }
    }

    // Priority 3: Check image_url (API compatibility)
    const imageUrl = business.image || (business as any).image_url;
    if (imageUrl &&
        typeof imageUrl === 'string' &&
        imageUrl.trim() !== '' &&
        !isPlaceholderImage(imageUrl)) {
      return { image: imageUrl, isPlaceholder: false };
    }

    // Priority 4: Canonical subcategory placeholder only (no old fuzzy mapping)
    const b = business as any;
    const placeholder = getSubcategoryPlaceholderFromCandidates([
      b.sub_interest_id,
      b.subInterestId,
      b.sub_interest_slug,
      b.category,
      b.interest_id,
      b.interestId,
    ]);
    return { image: placeholder, isPlaceholder: true };
  }, [business]);

  const displayImage = getDisplayImage.image;
  const isPlaceholder = getDisplayImage.isPlaceholder;
  const displayAlt = (business as any).alt || business.name;
  const displayTotal =
    (typeof business.totalRating === "number" && business.totalRating > 0 && business.totalRating) ||
    (typeof business.rating === "number" && business.rating > 0 && business.rating) ||
    (typeof business?.stats?.average_rating === "number" && business.stats.average_rating > 0 && business.stats.average_rating) ||
    0;

  // Handle image error - fallback to placeholder if uploaded image fails
  const handleImageError = () => {
    if (!usingFallback && !isPlaceholder) {
      setUsingFallback(true);
      setImgError(false);
    } else {
      setImgError(true);
    }
  };

  // Handle save/bookmark
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await toggleSavedItem(business.id);
    if (success) {
      // Toast is handled by SavedItemsContext
    }
  };

  // Handle write review
  const handleWriteReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(reviewRoute);
  };

  // Determine star gradient tier based on rating
  const starGradientId = useMemo(() => {
    if (!displayTotal || displayTotal === 0) return null;
    return displayTotal > 4.0 ? 'Gold' : displayTotal > 2.0 ? 'Bronze' : 'Low';
  }, [displayTotal]);

  // Handle share
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const shareUrl = /^https?:\/\//i.test(businessProfileRoute)
        ? businessProfileRoute
        : `${window.location.origin}${businessProfileRoute}`;
      const shareText = `Check out ${business.name} on sayso!`;
      
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  // Handle card click - navigate to business page
  const handleCardClick = () => {
    if (!isInternalBusinessRoute) {
      window.location.assign(businessProfileRoute);
      return;
    }
    router.push(businessProfileRoute);
  };

  useEffect(() => {
    if (!isInternalBusinessRoute) return;
    if (index > 1) return;
    if (typeof window === "undefined") return;

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const prefetch = () => {
      try {
        router.prefetch(businessProfileRoute);
      } catch {
        // Ignore prefetch failures.
      }
    };

    const idleCallback = (window as any).requestIdleCallback;
    if (typeof idleCallback === "function") {
      idleId = idleCallback(prefetch, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(prefetch, 200);
    }

    return () => {
      if (idleId !== null && typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [businessProfileRoute, index, isInternalBusinessRoute, router]);

  const handleCardMouseEnter = () => {
    if (!isInternalBusinessRoute) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      try {
        router.prefetch(businessProfileRoute);
      } catch {
        // Ignore hover prefetch failures.
      }
    }, 100);
  };

  const handleCardMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardTouchStart = () => {
    if (!isInternalBusinessRoute) return;
    try {
      router.prefetch(businessProfileRoute);
    } catch {
      // Ignore touch-intent prefetch failures.
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      id={idForSnap}
      className={`snap-center snap-always flex-shrink-0 h-full ${RAIL_CARD_WIDTH} list-none`}
      style={{
        fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontWeight: 600,
      }}
    >
      <div
        className={`relative bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 ${RAIL_CARD_RADIUS} overflow-hidden group cursor-pointer w-full h-full flex flex-col backdrop-blur-xl shadow-md`}
        style={{
          maxWidth: "540px",
        } as React.CSSProperties}
        role="link"
        tabIndex={0}
        onClick={handleCardClick}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        onTouchStart={handleCardTouchStart}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <BusinessOfTheMonthCardMedia
          displayImage={displayImage}
          isPlaceholder={isPlaceholder}
          displayAlt={displayAlt}
          imgError={imgError}
          usingFallback={usingFallback}
          index={index}
          onImageError={handleImageError}
          business={business}
          verified={(business as any).verified}
          hasReviews={hasReviews}
          displayTotal={displayTotal}
          starGradientId={starGradientId}
          activeOverlayBadge={activeOverlayBadge}
          badgeTransition={badgeTransition}
          canSwitchBadges={canSwitchBadges}
          isMediaHovered={isMediaHovered}
          onMouseEnter={() => {
            if (canSwitchBadges) setIsMediaHovered(true);
          }}
          onMouseLeave={() => {
            if (canSwitchBadges) setIsMediaHovered(false);
          }}
          onCardClick={handleCardClick}
          onWriteReview={handleWriteReview}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />

        <BusinessOfTheMonthCardContent
          business={business}
          hasReviews={hasReviews}
          onCardClick={handleCardClick}
          onWriteReview={handleWriteReview}
          displayTotal={displayTotal}
          isSaved={isSaved}
          onBookmark={handleBookmark}
        />
      </div>
    </div>
  );
}
