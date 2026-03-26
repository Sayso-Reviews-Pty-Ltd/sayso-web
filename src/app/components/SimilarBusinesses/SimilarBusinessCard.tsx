"use client";

import React, { memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Star } from "@/app/lib/icons";
import Image from "next/image";
import { ImageIcon } from "@/app/lib/icons";
import { getCategoryPlaceholder, isPlaceholderImage } from "../../utils/categoryToPngMapping";
import { getCategorySlugFromBusiness } from "../../utils/subcategoryPlaceholders";
import { getCategoryIcon } from "./getCategoryIcon";
import { CardContent, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

interface SimilarBusinessCardProps {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  image_url?: string;
  uploaded_images?: string[];
  category: string;
  location: string;
  address?: string;
  description?: string;
  rating?: number;
  totalRating?: number;
  reviews?: number;
  total_reviews?: number;
  verified?: boolean;
  priceRange?: string;
  price_range?: string;
  compact?: boolean;
  distanceKm?: number;
  sub_interest_id?: string | null;
  subInterestId?: string;
  subInterestLabel?: string;
}

function SimilarBusinessCard({
  id,
  slug,
  name,
  image,
  image_url,
  uploaded_images,
  category,
  location,
  address,
  description,
  rating,
  reviews,
  distanceKm,
  sub_interest_id,
  subInterestId,
  subInterestLabel,
}: SimilarBusinessCardProps) {
  const router = useRouter();

  const [imgError, setImgError] = React.useState(false);
  const [usingFallback, setUsingFallback] = React.useState(false);

  const categorySlug = getCategorySlugFromBusiness({ sub_interest_id, subInterestId, category });
  const placeholderSrc = getCategoryPlaceholder(categorySlug || undefined);

  const rawImage =
    (uploaded_images && uploaded_images.length > 0 && !isPlaceholderImage(uploaded_images[0]) ? uploaded_images[0] : null) ||
    (image_url && !isPlaceholderImage(image_url) ? image_url : null) ||
    (image && !isPlaceholderImage(image) ? image : null);
  const isPlaceholder = !rawImage;
  const displayImage = rawImage || placeholderSrc;

  const handleImageError = () => {
    if (!usingFallback && !isPlaceholder) {
      setUsingFallback(true);
      setImgError(false);
    } else {
      setImgError(true);
    }
  };

  const businessIdentifier = slug || id;

  const handleCardClick = () => {
    router.push(`/business/${businessIdentifier}`);
  };

  return (
    <Link
      href={`/business/${businessIdentifier}`}
      className="relative bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 rounded-[12px] overflow-hidden group cursor-pointer w-full h-full flex flex-col border-none backdrop-blur-xl shadow-md transition-all duration-300 hover:border-white/80 hover:-translate-y-1 hover:shadow-lg"
      style={{ minHeight: "416px" } as React.CSSProperties}
    >
      {/* Image Section */}
      <div className="relative w-full h-[300px] lg:h-[260px] overflow-hidden rounded-t-[12px]">
        {typeof rating === "number" && rating > 0 && (
          <div className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-2.5 py-1 text-charcoal shadow-md border-none">
            <Star className="w-4 h-4 text-charcoal fill-charcoal" strokeWidth={2.5} aria-hidden />
            <span className="text-xs font-semibold text-charcoal" style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontWeight: 600 }}>
              {Number(rating).toFixed(1)}
            </span>
          </div>
        )}

        {!imgError ? (
          <div className="relative w-full h-full overflow-hidden bg-card-bg">
            <div className="absolute inset-0">
              <Image
                src={usingFallback ? placeholderSrc : displayImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 340px, 340px"
                priority={false}
                quality={50}
                loading="lazy"
                style={{ filter: "blur(40px)", opacity: 0.6, transform: "scale(1.2)" }}
                aria-hidden="true"
              />
            </div>
            <div className="absolute inset-0">
              <Image
                src={usingFallback ? placeholderSrc : displayImage}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] group-active:scale-[0.98] motion-reduce:transition-none"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 340px, 340px"
                priority={false}
                quality={90}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
            <div
              className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-500 ease-out group-hover:opacity-0 motion-reduce:transition-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 30%, transparent 60%)" }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: "#E5E0E5" }}>
            <ImageIcon className="w-16 h-16 text-charcoal/20" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="px-4 py-4 bg-gradient-to-b from-card-bg/95 to-card-bg flex flex-col gap-2 rounded-b-[12px]">
        <CardTitle
          className="text-base sm:text-lg font-bold text-charcoal leading-tight line-clamp-1 transition-colors duration-300 group-hover:text-navbar-bg/90"
          style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontWeight: 700, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" } as React.CSSProperties}
          title={name}
        >
          {name}
        </CardTitle>

        {(typeof rating === "number" && rating > 0) || (typeof reviews === "number" && reviews > 0) ? (
          <div className="flex items-center justify-center gap-2 text-xs text-charcoal/60 -mt-0.5">
            {typeof rating === "number" && rating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-coral fill-coral" aria-hidden />
                <span className="font-semibold text-charcoal/70">{Number(rating).toFixed(1)}</span>
              </span>
            )}
            {typeof reviews === "number" && reviews > 0 && (
              <span className="text-charcoal/60">{reviews} {reviews === 1 ? "review" : "reviews"}</span>
            )}
          </div>
        ) : null}

        {description && (
          <CardDescription
            className="text-sm text-charcoal/70 line-clamp-2 leading-snug"
            style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontWeight: 400 }}
          >
            {description}
          </CardDescription>
        )}

        {(location || address) && (
          <div className="flex items-center gap-1.5 text-xs text-charcoal/60 mt-1">
            {(() => {
              const CategoryIcon = getCategoryIcon(category, categorySlug || subInterestId, subInterestLabel);
              return (
                <div className="w-8 h-8 rounded-full bg-navbar-bg/50 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-4 h-4 text-white/80" strokeWidth={2.5} />
                </div>
              );
            })()}
            <span className="truncate">{address || location}</span>
            {typeof distanceKm === "number" && distanceKm > 0 && (
              <span className="flex-shrink-0 text-charcoal/50">• {distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km</span>
            )}
          </div>
        )}

        <Button
          variant="bare"
          size="sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(); }}
          className={cn(
            "mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5",
            "bg-gradient-to-br from-navbar-bg to-navbar-bg/90 text-white rounded-full",
            "hover:from-navbar-bg/90 hover:to-navbar-bg/80 active:scale-95",
            "shadow-md border border-sage/50 focus:ring-2 focus:ring-sage/40"
          )}
          style={{ fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontWeight: 600 }}
        >
          <span>Go to business</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Link>
  );
}

export default memo(SimilarBusinessCard);
