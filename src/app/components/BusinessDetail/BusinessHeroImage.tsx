// src/components/BusinessDetail/BusinessHeroImage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import GoldStar from "../Icons/GoldStar";
import { getSubcategoryPlaceholder, isPlaceholderImage } from "../../utils/subcategoryPlaceholders";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/app/components/ui/carousel";

interface BusinessHeroImageProps {
  image: string;
  alt: string;
  rating: number;
  verified?: boolean;
  images?: string[];
  uploaded_images?: string[];
  /** Canonical subcategory slug for placeholder when no photos (e.g. sub_interest_id) */
  subcategorySlug?: string | null;
  sharedLayoutId?: string;
}

export default function BusinessHeroImage({
  image,
  alt,
  rating,
  verified = false,
  images = [],
  uploaded_images = [],
  subcategorySlug,
  sharedLayoutId,
}: BusinessHeroImageProps) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [emblaApi, setEmblaApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Deduplicated, real-photos-only list (priority: uploaded > images > image)
  const allImages = useMemo(() => {
    const imageSet = new Set<string>();
    uploaded_images.forEach((img) => {
      if (img && img.trim() && !isPlaceholderImage(img)) imageSet.add(img);
    });
    images.forEach((img) => {
      if (img && img.trim() && !isPlaceholderImage(img)) imageSet.add(img);
    });
    if (image && image.trim() && !isPlaceholderImage(image)) imageSet.add(image);
    return Array.from(imageSet);
  }, [image, images, uploaded_images]);

  const validImages = useMemo(
    () => allImages.filter((url) => !failedUrls.has(url)),
    [allImages, failedUrls]
  );

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const totalImages = validImages.length;
  const hasImage = totalImages > 0;
  const hasMultipleImages = totalImages > 1;
  const placeholderSrc = getSubcategoryPlaceholder(subcategorySlug ?? undefined);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Clamp index when failedUrls removes a slide
  useEffect(() => {
    if (hasImage && currentIndex >= totalImages) {
      setCurrentIndex(0);
      emblaApi?.scrollTo(0, true);
    }
  }, [totalImages, currentIndex, hasImage, emblaApi]);

  const entranceVariants = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };

  return (
    <m.div
      layoutId={sharedLayoutId}
      {...entranceVariants}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[50vh] sm:h-auto sm:aspect-[16/9] lg:aspect-[21/9] rounded-none overflow-hidden"
    >
      {hasImage ? (
        <Carousel
          setApi={setEmblaApi}
          opts={{ loop: true }}
          className="w-full h-full"
        >
          <CarouselContent>
            {validImages.map((src, i) => (
              <CarouselItem key={src}>
                {/* Blur background layer */}
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  quality={20}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 900px"
                  style={{ filter: "blur(40px)", opacity: 0.6, transform: "scale(1.2)" }}
                  aria-hidden="true"
                  priority={false}
                  loading="lazy"
                />
                {/* Sharp image layer */}
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 900px"
                  onError={() => handleImageError(src)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10" />

          {/* Navigation */}
          {hasMultipleImages && (
            <>
              <CarouselPrevious />
              <CarouselNext />

              {/* Dot indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "w-8 bg-white shadow-md" : "w-2 bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>

              {/* Image counter */}
              <div className="absolute bottom-6 right-6 z-30 px-3 py-1.5 rounded-full bg-charcoal/80 backdrop-blur-xl">
                <span
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
                >
                  {currentIndex + 1} / {totalImages}
                </span>
              </div>
            </>
          )}
        </Carousel>
      ) : (
        <div className="absolute inset-0 bg-card-bg overflow-hidden">
          <Image
            src={placeholderSrc}
            alt={alt}
            fill
            className="object-cover"
            priority
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 900px"
          />
        </div>
      )}

      {/* Verified Badge */}
      {verified && (
        <div className="absolute top-6 left-6 z-20">
          <span
            className="px-4 py-2 rounded-full text-body-sm font-600 backdrop-blur-xl border bg-card-bg/90 text-white border-sage/50"
            style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
          >
            Verified
          </span>
        </div>
      )}

      {/* Rating Badge */}
      <div className="absolute top-6 right-6 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-3 py-1.5 text-charcoal border-none">
        <GoldStar size={14} className="w-3.5 h-3.5" />
        <span
          className="text-body-sm font-semibold text-charcoal"
          style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontWeight: 600 }}
        >
          {Number(rating).toFixed(1)}
        </span>
      </div>
    </m.div>
  );
}
