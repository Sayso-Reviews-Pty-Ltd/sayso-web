'use client';

import { useEffect, useMemo, useState } from 'react';
import { getImageCacheKey, isFallbackEventArtwork, loadedEventImageKeys } from '../EventCard.utils';

export function useEventImageLoading(mediaImage: string, hasRealImage: boolean) {
  const mediaImageCacheKey = useMemo(() => getImageCacheKey(mediaImage), [mediaImage]);
  const [imageLoaded, setImageLoaded] = useState(
    () => !hasRealImage || (mediaImageCacheKey ? loadedEventImageKeys.has(mediaImageCacheKey) : true)
  );
  const showLoadingOverlay = hasRealImage && !imageLoaded;

  useEffect(() => {
    if (!hasRealImage) {
      setImageLoaded(true);
      return;
    }

    if (!mediaImageCacheKey) {
      setImageLoaded(true);
      return;
    }

    setImageLoaded(loadedEventImageKeys.has(mediaImageCacheKey));
  }, [hasRealImage, mediaImageCacheKey]);

  const handleImageLoadingComplete = () => {
    if (mediaImageCacheKey) {
      loadedEventImageKeys.add(mediaImageCacheKey);
    }
    setImageLoaded(true);
  };

  const handleImageError = () => {
    if (mediaImageCacheKey) {
      loadedEventImageKeys.add(mediaImageCacheKey);
    }
    setImageLoaded(true);
  };

  return {
    imageLoaded,
    showLoadingOverlay,
    mediaImageCacheKey,
    handleImageLoadingComplete,
    handleImageError,
  };
}
