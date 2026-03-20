'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import { BLUR_DATA_URL } from '../EventCard.constants';

interface EventCardMediaProps {
  mediaImage: string;
  altText: string;
  showLoadingOverlay: boolean;
  hasRealImage: boolean;
  imageLoaded: boolean;
  onImageLoadingComplete: () => void;
  onImageError: () => void;
  layoutId: string;
}

export function EventCardMedia({
  mediaImage,
  altText,
  showLoadingOverlay,
  hasRealImage,
  imageLoaded,
  onImageLoadingComplete,
  onImageError,
  layoutId,
}: EventCardMediaProps) {
  return (
    <div className="relative w-full flex-shrink-0 z-10">
      <m.div
        layoutId={layoutId}
        className="relative w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-off-white/95 to-off-white/85 h-[280px] sm:h-[300px] md:h-[220px]"
      >
        {showLoadingOverlay && (
          <div className="absolute inset-0 bg-charcoal/5 animate-pulse z-10 flex items-center justify-center">
            <span className="w-10 h-10 border-2 border-white/50 border-t-navbar-bg rounded-full animate-spin" aria-hidden />
            <span className="sr-only">Loading image</span>
          </div>
        )}
        <Image
          src={mediaImage}
          alt={altText}
          fill
          sizes="(max-width: 640px) 85vw, 340px"
          className={hasRealImage ? "object-cover card-img-zoom sm:group-active:scale-[0.98] motion-reduce:transition-none" : "object-contain w-32 h-32 sm:w-36 sm:h-36 md:w-32 md:h-32 card-img-zoom sm:group-active:scale-[0.98] motion-reduce:transition-none"}
          quality={hasRealImage ? 75 : 60}
          priority={false}
          onLoadingComplete={onImageLoadingComplete}
          onError={onImageError}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[1] card-overlay-fade motion-reduce:transition-none"
          style={{ background: "hsla(0, 0%, 0%, 0.2)" }}
          aria-hidden="true"
        />
      </m.div>
    </div>
  );
}
