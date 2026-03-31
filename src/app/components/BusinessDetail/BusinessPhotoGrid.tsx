"use client";

import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import { ArrowDown, ChevronLeft, ChevronRight, X } from "@/app/lib/icons";
import { Card } from "@/app/components/ui/card";
import { Dialog, DialogPortal, DialogOverlay } from "@/app/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/app/components/atoms/Button";
import { cn } from "@/app/lib/utils";

interface BusinessPhotoGridProps {
  businessName: string;
  photos?: string[];
}

export default function BusinessPhotoGrid({ businessName, photos = [] }: BusinessPhotoGridProps) {
  const normalizedPhotos = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];

    photos.forEach((photo) => {
      if (!photo || typeof photo !== "string") return;
      const trimmed = photo.trim();
      if (!trimmed || seen.has(trimmed)) return;
      seen.add(trimmed);
      result.push(trimmed);
    });

    return result;
  }, [photos]);

  const gridPhotos = normalizedPhotos.slice(0, 9);
  const hasPhotos = gridPhotos.length > 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openModalAt = (index: number) => {
    if (normalizedPhotos.length === 0) return;
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const goPrev = () => {
    setActiveIndex((prev) => {
      if (normalizedPhotos.length === 0) return 0;
      return prev === 0 ? normalizedPhotos.length - 1 : prev - 1;
    });
  };

  const goNext = () => {
    setActiveIndex((prev) => {
      if (normalizedPhotos.length === 0) return 0;
      return prev === normalizedPhotos.length - 1 ? 0 : prev + 1;
    });
  };

  // Arrow key navigation only — ESC and scroll lock are handled by Radix Dialog
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen, normalizedPhotos.length]);

  return (
    <Card asChild variant="detail" className="p-4 sm:p-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h3 className="text-h3 font-semibold text-charcoal mb-3">Photos</h3>

        {hasPhotos ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 rounded-[12px]">
              {gridPhotos.map((photo, index) => (
                <Button
                  key={`${photo}-${index}`}
                  variant="bare"
                  type="button"
                  onClick={() => openModalAt(index)}
                  className="relative aspect-square overflow-hidden rounded-[10px] bg-off-white/60 focus:outline-none focus:ring-2 focus:ring-navbar-bg/40 min-h-0 p-0 w-full"
                  aria-label={`Open photo ${index + 1}`}
                >
                  <Image
                    src={photo}
                    alt={`${businessName} photo ${index + 1}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 22vw, (max-width: 1535px) 18vw, 15vw"
                  />
                </Button>
              ))}
            </div>

            <Button
              variant="bare"
              type="button"
              onClick={() => openModalAt(0)}
              className="mt-4 w-full rounded-full bg-navbar-bg px-5 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-navbar-bg/90 min-h-0"
            >
              View More
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-white/35 bg-off-white/60 px-4 py-6 text-center">
              <p className="text-body-sm text-charcoal/70">
                Photos from this business profile will appear here once gallery images are
                available.
              </p>
              <p className="mt-2 text-xs text-charcoal/60">
                This section uses the business gallery images for consistency.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-charcoal/60 animate-pulse">
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs font-medium">
                Scroll down for similar businesses at the bottom
              </span>
            </div>

            <Button
              variant="bare"
              type="button"
              disabled
              className="w-full rounded-full bg-navbar-bg/60 px-5 py-3 text-body-sm font-semibold text-white/80 cursor-not-allowed min-h-0"
            >
              View More
            </Button>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogPortal>
            <DialogOverlay className="bg-charcoal/95 backdrop-blur-sm" />
            <DialogPrimitive.Content
              aria-label="Business photo gallery"
              className="fixed inset-0 z-[99999] bg-transparent outline-none"
              onEscapeKeyDown={closeModal}
            >
              <div className="relative h-full w-full">
                <Button
                  variant="bare"
                  type="button"
                  onClick={closeModal}
                  className={cn(
                    "absolute right-4 top-4 z-20 h-10 w-10 rounded-full",
                    "bg-white/15 text-white hover:bg-white/25 transition-colors",
                    "min-h-0 p-0 [&_svg]:size-5"
                  )}
                  aria-label="Close gallery"
                >
                  <X />
                </Button>

                {normalizedPhotos.length > 1 && (
                  <>
                    <Button
                      variant="bare"
                      type="button"
                      onClick={goPrev}
                      className={cn(
                        "absolute left-4 top-1/2 z-20 -translate-y-1/2",
                        "h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors",
                        "min-h-0 p-0 [&_svg]:size-6"
                      )}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="bare"
                      type="button"
                      onClick={goNext}
                      className={cn(
                        "absolute right-4 top-1/2 z-20 -translate-y-1/2",
                        "h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors",
                        "min-h-0 p-0 [&_svg]:size-6"
                      )}
                      aria-label="Next photo"
                    >
                      <ChevronRight />
                    </Button>
                  </>
                )}

                <div className="relative h-full w-full p-4 sm:p-8">
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]">
                    <Image
                      src={normalizedPhotos[activeIndex]}
                      alt={`${businessName} photo ${activeIndex + 1}`}
                      fill
                      className="object-contain"
                      priority
                      sizes="100vw"
                    />
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/70 px-3 py-1.5">
                  <span className="text-xs text-white">
                    {activeIndex + 1} / {normalizedPhotos.length}
                  </span>
                </div>
              </div>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      </m.div>
    </Card>
  );
}
