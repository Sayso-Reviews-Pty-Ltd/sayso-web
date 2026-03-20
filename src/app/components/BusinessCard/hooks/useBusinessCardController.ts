"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useSavedItems } from "../../../contexts/SavedItemsContext";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getCategoryLabelFromBusiness,
  getCategorySlugFromBusiness,
  getSubcategoryPlaceholderFromCandidates,
  isPlaceholderImage,
} from "../../../utils/subcategoryPlaceholders";
import {
  coerceCoordinate,
  formatDistanceAway,
  useBusinessDistanceLocation,
} from "../../../hooks/useBusinessDistanceLocation";
import type { Business } from "../BusinessCard.types";

interface UseBusinessCardControllerOptions {
  business: Business;
  ownerView: boolean;
  index: number;
  showActionsProp?: boolean;
}

export function useBusinessCardController({
  business,
  ownerView,
  index,
  showActionsProp,
}: UseBusinessCardControllerOptions) {
  const router = useRouter();
  const { toggleSavedItem, isItemSaved } = useSavedItems();
  const { showToast } = useToast();
  const { user } = useAuth();
  const hasReviewed = false;

  const idForSnap = useMemo(() => `business-${business.id}`, [business.id]);
  const businessImageLayoutId = useMemo(() => `business-media-${business.id}`, [business.id]);
  const businessTitleLayoutId = useMemo(() => `business-title-${business.id}`, [business.id]);

  const isBusinessAccount = useMemo(() => {
    return (
      user?.profile?.account_role === "business_owner" ||
      user?.profile?.role === "business_owner"
    );
  }, [user?.profile?.account_role, user?.profile?.role]);

  const showActions = useMemo(() => {
    if (showActionsProp !== undefined) {
      return showActionsProp;
    }

    const isMyBusinessesPage =
      typeof window !== "undefined" && window.location.pathname === "/my-businesses";
    if (isBusinessAccount && isMyBusinessesPage) {
      return false;
    }
    return true;
  }, [showActionsProp, isBusinessAccount]);

  const [imgError, setImgError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const normalizedLat = coerceCoordinate(
    (business as Business & { latitude?: unknown }).lat ??
      (business as Business & { latitude?: unknown }).latitude
  );
  const normalizedLng = coerceCoordinate(
    (business as Business & { longitude?: unknown }).lng ??
      (business as Business & { longitude?: unknown }).longitude
  );
  const hasCoordinates = normalizedLat !== null && normalizedLng !== null;
  const { status: locationStatus, getDistanceKm } = useBusinessDistanceLocation();

  const distanceLabel = useMemo(() => {
    if (!hasCoordinates) return null;
    const distanceKm = getDistanceKm(normalizedLat, normalizedLng);
    if (distanceKm === null) return null;
    return formatDistanceAway(distanceKm);
  }, [getDistanceKm, hasCoordinates, normalizedLat, normalizedLng]);

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
    if (locationStatus === "denied") return "Location off";
    return "Enable location";
  }, [distanceLabel, hasCoordinates, locationStatus]);

  const businessIdentifier = business.slug || business.id;
  const reviewRoute = useMemo(() => `/business/${businessIdentifier}/review`, [businessIdentifier]);
  const businessProfileRoute = useMemo(
    () => (ownerView ? `/my-businesses/${businessIdentifier}` : `/business/${businessIdentifier}`),
    [businessIdentifier, ownerView]
  );

  useEffect(() => {
    if (index > 1) return;
    if (typeof window === "undefined") return;

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const prefetch = () => {
      try {
        router.prefetch(businessProfileRoute);
      } catch {
        // ignore prefetch failures
      }
    };

    const idleCallback = win.requestIdleCallback;
    if (typeof idleCallback === "function") {
      idleId = idleCallback(prefetch, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(prefetch, 200);
    }

    return () => {
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [index, router, businessProfileRoute]);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      router.prefetch(businessProfileRoute);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = () => {
    try {
      router.prefetch(businessProfileRoute);
    } catch {
      // Ignore prefetch failures on touch intent.
    }
  };

  const handleCardClick = () => {
    router.push(businessProfileRoute);
  };

  const handleWriteReview = () => {
    if (!hasReviewed) {
      router.push(reviewRoute);
    }
  };

  const handleBookmark = async () => {
    await toggleSavedItem(business.id);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}${businessProfileRoute}`;
      const shareText = `Check out ${business.name} on sayso!`;

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ title: business.name, text: shareText, url: shareUrl })
      ) {
        try {
          await navigator.share({
            title: business.name,
            text: shareText,
            url: shareUrl,
          });
          showToast("Shared successfully!", "success", 2000);
          return;
        } catch (shareError: unknown) {
          if (
            typeof shareError === "object" &&
            shareError &&
            "name" in shareError &&
            (shareError as { name?: string }).name === "AbortError"
          ) {
            return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard!", "success", 2000);
      } catch (clipboardError) {
        showToast("Failed to copy link. Please copy manually.", "sage", 3000);
        console.error("Clipboard error:", clipboardError);
      }
    } catch (error) {
      console.error("Share error:", error);
      showToast("Failed to share. Please try again.", "sage", 3000);
    }
  };

  const categoryKey = getCategorySlugFromBusiness(business) || "default";
  const displayCategoryLabel = getCategoryLabelFromBusiness(business);

  if (process.env.NODE_ENV === "development") {
    console.log("[CARD CATEGORY DEBUG]", {
      id: business.id,
      name: business.name,
      sub_interest_id: (business as { sub_interest_id?: string }).sub_interest_id,
      subInterestId: business.subInterestId,
      interest_id: (business as { interest_id?: string }).interest_id,
      interestId: business.interestId,
      category: business.category,
      categoryKey,
      displayCategoryLabel,
    });
  }

  const getDisplayImage = useMemo(() => {
    if (
      business.business_images &&
      Array.isArray(business.business_images) &&
      business.business_images.length > 0
    ) {
      const primaryImage = business.business_images.find((img) => img.is_primary === true);
      const imageUrl = primaryImage?.url || business.business_images[0]?.url;

      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "" &&
        !isPlaceholderImage(imageUrl)
      ) {
        return { image: imageUrl, isPlaceholder: false };
      }
    }

    if (
      business.uploaded_images &&
      Array.isArray(business.uploaded_images) &&
      business.uploaded_images.length > 0
    ) {
      const imageUrl = business.uploaded_images[0];
      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "" &&
        !isPlaceholderImage(imageUrl)
      ) {
        return { image: imageUrl, isPlaceholder: false };
      }
    }

    if (
      business.image_url &&
      typeof business.image_url === "string" &&
      business.image_url.trim() !== "" &&
      !isPlaceholderImage(business.image_url)
    ) {
      return { image: business.image_url, isPlaceholder: false };
    }

    if (
      business.image &&
      typeof business.image === "string" &&
      business.image.trim() !== "" &&
      !isPlaceholderImage(business.image)
    ) {
      return { image: business.image, isPlaceholder: false };
    }

    const placeholder = getSubcategoryPlaceholderFromCandidates([
      (business as { sub_interest_id?: string }).sub_interest_id,
      business.subInterestId,
      (business as { sub_interest_slug?: string }).sub_interest_slug,
      (business as { interest_id?: string }).interest_id,
      business.interestId,
      business.category,
    ]);
    return { image: placeholder, isPlaceholder: true };
  }, [
    business.business_images,
    business.uploaded_images,
    business.image_url,
    business.image,
    (business as { sub_interest_id?: string }).sub_interest_id,
    business.subInterestId,
    (business as { interest_id?: string }).interest_id,
    business.interestId,
    business.category,
  ]);

  const displayImage = getDisplayImage.image;
  const isImagePng = getDisplayImage.isPlaceholder;
  const displayAlt = business.alt || business.name;

  const initialTotalReviews = business.reviews ?? 0;
  const initialRating =
    (typeof business.totalRating === "number" && business.totalRating) ||
    (typeof business.rating === "number" && business.rating) ||
    (typeof business?.stats?.average_rating === "number" && business.stats.average_rating) ||
    0;

  const totalReviews = Number.isFinite(initialTotalReviews) ? Number(initialTotalReviews) : 0;
  const resolvedRating = Number.isFinite(initialRating) ? Number(initialRating) : 0;
  const hasRating = resolvedRating > 0;
  const displayRating = hasRating ? resolvedRating : undefined;

  const handleImageError = () => {
    if (!usingFallback && !isImagePng) {
      setUsingFallback(true);
      setImgError(false);
    } else {
      setImgError(true);
    }
  };

  const onWriteReviewClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleWriteReview();
  };

  const onCardClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleCardClick();
  };

  const onBookmarkClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void handleBookmark();
  };

  const onShareClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void handleShare();
  };

  return {
    idForSnap,
    businessImageLayoutId,
    businessTitleLayoutId,
    isBusinessAccount,
    showActions,
    distanceBadgeText,
    distanceHint,
    categoryKey,
    displayCategoryLabel,
    businessProfileRoute,
    hasReviewed,
    displayImage,
    isImagePng,
    displayAlt,
    imgError,
    usingFallback,
    totalReviews,
    hasRating,
    displayRating,
    isItemSaved: isItemSaved(business.id),
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleImageError,
    onWriteReviewClick,
    onCardClick,
    onBookmarkClick,
    onShareClick,
  };
}
