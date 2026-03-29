"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { H2, H3 } from "@/app/components/ui/typography";
import { X, Sliders, Star, Move, Truck, Navigation, MapPin } from "@/app/lib/icons";
import { Dialog, DialogPortal } from "@/app/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/app/components/atoms/Button";
import { cn } from "@/app/lib/utils";

export interface FilterState {
  categories?: string[];
  minRating: number | null;
  distance: string | null;
}

interface FilterModalProps {
  isOpen: boolean; // controls enter/exit transition
  isVisible: boolean; // mount/unmount
  onClose: () => void;
  /** Callback fired when modal closes with the current filter state */
  onFiltersChange?: (filters: FilterState) => void;
  /** element to anchor under (the search input wrapper) */
  anchorRef?: React.RefObject<HTMLElement>;
  /** Initial filter state to display */
  initialFilters?: FilterState;
}

export default function FilterModal({
  isOpen,
  isVisible,
  onClose,
  onFiltersChange,
  anchorRef,
  initialFilters,
}: FilterModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(
    initialFilters?.minRating || null
  );
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    initialFilters?.distance || null
  );

  const hasChangesRef = useRef(false);

  useEffect(() => {
    if (initialFilters) {
      setSelectedRating(initialFilters.minRating || null);
      setSelectedDistance(initialFilters.distance || null);
      hasChangesRef.current = false;
    }
  }, [initialFilters]);

  // computed position for anchored panel
  const [style, setStyle] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 360,
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const gap = isMobile ? -2 : 8;
    const horizontalPadding = 16;
    const left = horizontalPadding;
    const width = window.innerWidth - horizontalPadding * 2;
    const top = rect.bottom + gap;

    setStyle({ top, left, width });
  }, [anchorRef]);

  useEffect(() => {
    if (!isVisible) return;
    updatePosition();

    const onWin = () => updatePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);

    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [isVisible, updatePosition]);

  // Scroll modal into view when it opens
  useEffect(() => {
    if (!isVisible || !isOpen) return;

    const timer = setTimeout(() => {
      const anchor = anchorRef?.current;
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const scrollTop = window.scrollY + rect.top - 20;
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible, isOpen, anchorRef]);

  const handleClose = useCallback(() => {
    if (hasChangesRef.current && onFiltersChange) {
      onFiltersChange({
        minRating: selectedRating,
        distance: selectedDistance,
      });
    }
    onClose();
  }, [selectedRating, selectedDistance, onFiltersChange, onClose]);

  const handleRatingChange = useCallback((rating: number | null) => {
    setSelectedRating(rating);
    hasChangesRef.current = true;
  }, []);

  const handleDistanceChange = useCallback((distance: string | null) => {
    setSelectedDistance(distance);
    hasChangesRef.current = true;
  }, []);

  if (!isVisible) return null;

  const distanceOptions = [
    { distance: "1 km", Icon: Move },
    { distance: "5 km", Icon: Truck },
    { distance: "10 km", Icon: Truck },
    { distance: "25 km", Icon: Navigation },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Content
          aria-label="Search filters"
          onInteractOutside={(e) => {
            if (anchorRef?.current?.contains(e.target as Node)) {
              e.preventDefault();
              return;
            }
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
          className={cn(
            "fixed z-[500] rounded-[12px] overflow-hidden",
            "bg-off-white border border-white/30 shadow-2xl",
            "transition-all duration-200 flex flex-col",
            "font-urbanist outline-none",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          )}
          style={{
            top: style.top,
            left: style.left,
            width: style.width || (typeof window !== "undefined" ? `calc(100vw - 32px)` : 400),
            maxWidth: "calc(100vw - 32px)",
            height: "50dvh",
            maxHeight: "50dvh",
          }}
        >
          {/* header */}
          <div className="relative flex items-center justify-between px-4 sm:px-5 md:px-6 pt-4 pb-3 border-b border-white/30 bg-off-white shadow-sm transition-all duration-300 flex-shrink-0">
            <div className="relative z-10 flex items-center gap-2">
              <Sliders className="w-4 h-4 sm:w-4 sm:h-4 text-warning-600" />
              <H2 className="text-base sm:text-sm font-semibold text-charcoal tracking-tight">
                Filters
              </H2>
            </div>
            <Button
              variant="bare"
              onClick={handleClose}
              className="relative z-10 w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-charcoal/10 bg-off-white/70 hover:bg-card-bg/10 hover:text-sage text-charcoal/80 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-sage/30 touch-manipulation min-h-0 p-0 [&_svg]:size-5 sm:[&_svg]:size-4"
              aria-label="Close filters"
            >
              <X />
            </Button>
          </div>

          {/* body */}
          <div
            className="px-4 sm:px-5 md:px-6 py-4 space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain flex-1 min-h-0"
            style={{ WebkitOverflowScrolling: "touch" }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Rating */}
            <section className="rounded-[12px] bg-off-white/70 border border-charcoal/10 p-3 sm:p-4 animate-fade-in-up [animation-delay:0.05s]">
              <H3 className="text-base sm:text-sm font-semibold text-charcoal mb-3 sm:mb-3 flex items-center gap-2 tracking-tight">
                <Star className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-warning-600" />
                Minimum Rating
              </H3>
              <div className="flex flex-wrap gap-2 sm:gap-2">
                {[5, 4, 3, 2, 1].map((r) => {
                  const active = selectedRating === r;
                  return (
                    <Button
                      key={r}
                      variant="bare"
                      type="button"
                      onClick={() => handleRatingChange(active ? null : r)}
                      className={cn(
                        "px-3 sm:px-3 py-2.5 sm:py-2 rounded-full text-sm sm:text-xs flex items-center gap-2 border transition-all min-h-[44px] sm:min-h-0 touch-manipulation focus:outline-none focus:ring-2 focus:ring-sage/30",
                        active
                          ? "bg-card-bg text-white border-sage shadow-sm"
                          : "bg-off-white text-charcoal border-charcoal/10 hover:border-sage/40 hover:bg-card-bg/5 active:bg-card-bg/10"
                      )}
                      aria-pressed={active}
                      aria-label={`${r}+ stars`}
                    >
                      <div className="flex">
                        {[...Array(r)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4 sm:w-4 sm:h-4",
                              active ? "text-white" : "text-sage"
                            )}
                          />
                        ))}
                      </div>
                      <span>{r}+</span>
                    </Button>
                  );
                })}
              </div>
            </section>

            {/* Distance */}
            <section className="rounded-[12px] bg-off-white/70 border border-charcoal/10 p-3 sm:p-4 animate-fade-in-up [animation-delay:0.1s]">
              <H3 className="text-base sm:text-sm font-semibold text-charcoal mb-3 sm:mb-3 flex items-center gap-2 tracking-tight">
                <MapPin className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-warning-600" />
                Distance
              </H3>
              <div className="flex flex-wrap gap-2 sm:gap-2">
                {distanceOptions.map(({ distance, Icon }) => {
                  const active = selectedDistance === distance;
                  return (
                    <Button
                      key={distance}
                      variant="bare"
                      type="button"
                      onClick={() => handleDistanceChange(active ? null : distance)}
                      className={cn(
                        "px-3 sm:px-3 py-2.5 sm:py-2 rounded-full text-sm sm:text-xs flex items-center gap-2 border transition-all whitespace-nowrap min-h-[44px] sm:min-h-0 touch-manipulation focus:outline-none focus:ring-2 focus:ring-coral/30",
                        active
                          ? "bg-coral text-white border-coral shadow-sm"
                          : "bg-off-white text-charcoal border-charcoal/10 hover:border-coral/40 hover:bg-coral/5 active:bg-coral/10"
                      )}
                      aria-pressed={active}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0",
                          active ? "text-white" : "text-coral"
                        )}
                      />
                      <span>{distance}</span>
                    </Button>
                  );
                })}
              </div>
            </section>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
