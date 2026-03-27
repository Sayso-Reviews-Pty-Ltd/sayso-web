"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { cn } from "@/app/lib/utils";
import { ChevronLeft, ChevronRight } from "@/app/lib/icons";

export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

interface CarouselContextProps extends CarouselProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within <Carousel />");
  return ctx;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    { orientation = "horizontal", opts, setApi, plugins, className, children, ...props },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((a: CarouselApi) => {
      if (!a) return;
      setCanScrollPrev(a.canScrollPrev());
      setCanScrollNext(a.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); scrollPrev(); }
        else if (e.key === "ArrowRight") { e.preventDefault(); scrollNext(); }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (api && setApi) setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => { api.off("select", onSelect); };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef, api, opts,
          orientation: orientation ?? (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev, scrollNext, canScrollPrev, canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

/**
 * The scrollable viewport + flex track.
 * Defaults to no margin/padding — image carousels want zero gap between slides.
 */
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden h-full w-full">
      <div
        ref={ref}
        className={cn(
          "flex h-full",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

/** A single slide — fills the carousel width/height by default. */
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    className={cn("min-w-0 shrink-0 grow-0 basis-full h-full relative", className)}
    {...props}
  />
));
CarouselItem.displayName = "CarouselItem";

/** Brand-styled previous button — absolutely positioned for overlay carousels. */
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30",
        "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
        "bg-off-white/95 backdrop-blur-xl shadow-lg border-none",
        "flex items-center justify-center",
        "transition-all duration-200 hover:bg-white hover:scale-110",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      disabled={!canScrollPrev}
      onClick={(e) => { scrollPrev(); onClick?.(e); }}
      aria-label="Previous image"
      {...props}
    >
      <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-charcoal" strokeWidth={2.5} />
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

/** Brand-styled next button — absolutely positioned for overlay carousels. */
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30",
        "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
        "bg-off-white/95 backdrop-blur-xl shadow-lg border-none",
        "flex items-center justify-center",
        "transition-all duration-200 hover:bg-white hover:scale-110",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      disabled={!canScrollNext}
      onClick={(e) => { scrollNext(); onClick?.(e); }}
      aria-label="Next image"
      {...props}
    >
      <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-charcoal" strokeWidth={2.5} />
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
