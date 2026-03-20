import type { Event } from '../../lib/types/Event';
import {
  EVENT_IMAGE_BASE_PATH,
  SPECIAL_FOOD_KEYWORDS,
  SPECIAL_DRINK_KEYWORDS,
  EVENT_SPORT_KEYWORDS,
} from './EventCard.constants';

export const loadedEventImageKeys = new Set<string>();

export const fixImageUrl = (url: string): string =>
  url.startsWith("//") ? `https:${url}` : url;

export const getImageCacheKey = (url: string): string => {
  const normalizedUrl = fixImageUrl(url.trim());
  if (!normalizedUrl) return "";

  if (normalizedUrl.startsWith("/")) {
    return normalizedUrl.toLowerCase();
  }

  try {
    const parsed = new URL(normalizedUrl);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`.toLowerCase();
  } catch {
    return normalizedUrl.toLowerCase();
  }
};

export const isFallbackEventArtwork = (url: string): boolean =>
  getImageCacheKey(url).startsWith(`${EVENT_IMAGE_BASE_PATH}/`);

export const getEventMediaImage = (event: Event) => {
  // Priority 0: Uploaded images array (newer events)
  const uploadedImages = (event as any).uploaded_images as string[] | undefined;
  if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
    const first = uploadedImages.find((img) => typeof img === "string" && img.trim()) || uploadedImages[0];
    if (first && typeof first === "string" && first.trim()) {
      return fixImageUrl(first);
    }
  }

  // Priority 1: Use real uploaded images from event
  if (event.image && event.image.trim()) {
    return fixImageUrl(event.image);
  }

  // Priority 1b: Common API aliases
  if ((event as any).image_url && typeof (event as any).image_url === "string" && (event as any).image_url.trim()) {
    return fixImageUrl((event as any).image_url as string);
  }

  if ((event as any).heroImage && typeof (event as any).heroImage === "string" && (event as any).heroImage.trim()) {
    return fixImageUrl((event as any).heroImage as string);
  }

  if ((event as any).bannerImage && typeof (event as any).bannerImage === "string" && (event as any).bannerImage.trim()) {
    return fixImageUrl((event as any).bannerImage as string);
  }

  // Priority 2: Use business image carousel if available (for business-owned events)
  if ((event as any).businessImages && (event as any).businessImages.length > 0) {
    return fixImageUrl((event as any).businessImages[0]);
  }

  // Fallback: Generate icon based on event type/keywords
  const haystack = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (event.type === "event") {
    if (EVENT_SPORT_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
      return `${EVENT_IMAGE_BASE_PATH}/033-sport.png`;
    }

    if (haystack.includes("yoga")) {
      return `${EVENT_IMAGE_BASE_PATH}/015-yoga.png`;
    }

    if (haystack.includes("music") || haystack.includes("concert")) {
      return `${EVENT_IMAGE_BASE_PATH}/040-stage.png`;
    }

    return `${EVENT_IMAGE_BASE_PATH}/022-party-people.png`;
  }

  if (SPECIAL_DRINK_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return `${EVENT_IMAGE_BASE_PATH}/007-beer-tap.png`;
  }

  if (SPECIAL_FOOD_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return `${EVENT_IMAGE_BASE_PATH}/031-fast-food.png`;
  }

  return `${EVENT_IMAGE_BASE_PATH}/025-open-book.png`;
};
