"use client";

import React, { useState, useMemo } from "react";
import { AlertCircle, MessageCircle, ChevronDown, Star } from "@/app/lib/icons";
import Link from "next/link";
import ReviewCard from "./ReviewCard";
import type { ReviewWithUser } from "../../lib/types/database";
import { useRealtimeReviews, useRealtimeHelpfulVotes } from "../../hooks/useRealtime";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/components/ui/collapsible";

interface ReviewsListProps {
  reviews: ReviewWithUser[];
  loading?: boolean;
  error?: string | null;
  showBusinessInfo?: boolean;
  onUpdate?: () => void;
  emptyMessage?: string;
  emptyStateAction?: {
    label: string;
    href: string;
    disabled?: boolean;
  };
  isOwnerView?: boolean;
  businessId?: string;
  initiallyExpanded?: boolean;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "text-coral fill-coral"
              : "text-charcoal/20 fill-charcoal/10"
          }
        />
      ))}
    </span>
  );
}

export default function ReviewsList({
  reviews: initialReviews,
  loading = false,
  error = null,
  showBusinessInfo = false,
  onUpdate,
  emptyMessage = "No reviews yet. Be the first to share your experience!",
  emptyStateAction,
  isOwnerView = false,
  businessId,
  initiallyExpanded = false,
}: ReviewsListProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded || isOwnerView);

  const { reviews: realtimeReviews } = useRealtimeReviews(businessId, initialReviews);
  const reviews = businessId ? realtimeReviews : initialReviews;

  const reviewIds = reviews.map((r) => r.id);
  const { helpfulCounts } = useRealtimeHelpfulVotes(businessId, reviewIds);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;
  }, [reviews]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-charcoal/8 bg-off-white p-4 shadow-none">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="border-red-200 bg-red-50 p-6 text-center shadow-none">
          <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
          <h3 className="font-urbanist text-base font-semibold text-red-800 mb-1">
            Unable to load reviews
          </h3>
          <p className="font-urbanist text-sm text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="font-urbanist flex flex-1 items-center justify-center">
        <Card className="bg-transparent border-none shadow-none text-center w-full max-w-md py-8">
          <CardContent className="flex flex-col items-center px-0">
            <div className="w-16 h-16 mx-auto mb-3 bg-off-white/80 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-charcoal/50" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-1">No reviews yet</h3>
            <p className="text-sm text-charcoal/60 mb-6">{emptyMessage}</p>
            {emptyStateAction && (
              <Link
                href={emptyStateAction.href}
                className={`inline-block px-6 py-3 rounded-full text-sm font-semibold transition-colors ${
                  emptyStateAction.disabled
                    ? "bg-charcoal/20 text-charcoal/70 cursor-not-allowed"
                    : "bg-coral text-white hover:bg-coral/90"
                }`}
                onClick={(e) => {
                  if (emptyStateAction.disabled) e.preventDefault();
                }}
                aria-disabled={emptyStateAction.disabled}
              >
                {emptyStateAction.label}
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="font-urbanist">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-charcoal/10 bg-off-white hover:bg-charcoal/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <StarRating rating={avgRating} />
            <span className="text-sm font-semibold text-charcoal tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-charcoal/30 text-xs">·</span>
            <span className="text-sm text-charcoal/60">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-charcoal/50 flex-shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className="pt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onUpdate={onUpdate}
              showBusinessInfo={showBusinessInfo}
              isOwnerView={isOwnerView}
              realtimeHelpfulCount={helpfulCounts[review.id]}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
