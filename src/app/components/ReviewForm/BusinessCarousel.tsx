"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { Star } from "@/app/lib/icons";
import { isPlaceholderImage, getSubcategoryPlaceholder } from "../../utils/subcategoryPlaceholders";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/app/components/ui/carousel";

interface BusinessCarouselProps {
  businessName: string;
  businessImages: string[];
  /** Canonical subcategory slug for placeholder when no photos (e.g. sub_interest_id) */
  subcategorySlug?: string | null;
}

export default function BusinessCarousel({ businessName, businessImages, subcategorySlug }: BusinessCarouselProps) {
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [emblaApi, setEmblaApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const validImages = businessImages?.filter((img) =>
    img && img.trim() !== "" && !isPlaceholderImage(img)
  ) ?? [];
  const totalImages = validImages.length;
  const hasImages = totalImages > 0;
  const hasMultipleImages = totalImages > 1;
  const placeholderSrc = getSubcategoryPlaceholder(subcategorySlug ?? undefined);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const entranceVariants = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };

  // No real images — show subcategory placeholder
  if (!hasImages) {
    return (
      <m.div
        {...entranceVariants}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[50vh] sm:h-auto sm:aspect-[16/9] lg:aspect-[21/9] rounded-none overflow-hidden"
      >
        <div className="absolute inset-0 bg-card-bg">
          <Image
            src={placeholderSrc}
            alt={`${businessName} placeholder`}
            fill
            className="object-cover"
            priority
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 900px"
          />
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      {...entranceVariants}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[50vh] sm:h-auto sm:aspect-[16/9] lg:aspect-[21/9] rounded-none overflow-hidden"
    >
      <Carousel
        setApi={setEmblaApi}
        opts={{ loop: true }}
        className="w-full h-full"
      >
        <CarouselContent>
          {validImages.map((src, i) => (
            <CarouselItem key={`${src}-${i}`}>
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
                onError={() => setImageError((prev) => ({ ...prev, [i]: true }))}
              />
              {/* Sharp image layer */}
              <Image
                src={src}
                alt={`${businessName} photo ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 900px"
                onError={() => setImageError((prev) => ({ ...prev, [i]: true }))}
              />

              {/* Per-slide error state */}
              {imageError[i] && (
                <div className="absolute inset-0 flex items-center justify-center bg-card-bg z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-coral/20 to-coral/10 flex items-center justify-center">
                      <Star className="w-10 h-10 sm:w-12 sm:h-12 text-charcoal" strokeWidth={1.5} />
                    </div>
                    <p
                      className="text-body-sm text-charcoal/70 font-medium uppercase tracking-wide"
                      style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
                    >
                      IMAGE UNAVAILABLE
                    </p>
                  </div>
                </div>
              )}
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
                className="text-xs font-semibold text-white"
                style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
              >
                {currentIndex + 1} / {totalImages}
              </span>
            </div>
          </>
        )}
      </Carousel>
    </m.div>
  );
}
