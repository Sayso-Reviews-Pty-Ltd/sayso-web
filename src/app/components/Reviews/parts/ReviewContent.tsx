"use client";

import type { ReviewWithUser } from "../../../lib/types/database";
import { Badge } from "@/app/components/ui/badge";
import { ReviewGallery } from "../ReviewGallery";

interface ReviewContentProps {
  review: ReviewWithUser;
  showBusinessInfo: boolean;
  isDesktop: boolean;
}

export function ReviewContent({ review, showBusinessInfo, isDesktop }: ReviewContentProps) {
  return (
    <>
      {review.title && (
        <h4
          className={`font-urbanist text-xl font-600 text-charcoal mb-2 ${
            isDesktop ? "" : "group-hover:text-sage transition-colors duration-300"
          }`}
        >
          {review.title}
        </h4>
      )}

      {showBusinessInfo && "business" in review && (
        <div className="mb-3 p-2 bg-card-bg/10 rounded-lg">
          <span className="font-urbanist text-sm font-500 text-sage">
            Review for: {(review as ReviewWithUser & { business: { name: string } }).business?.name}
          </span>
        </div>
      )}

      <p className="font-urbanist text-base font-600 text-charcoal/90 leading-relaxed mb-4">
        {review.content}
      </p>

      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag) => (
            <Badge
              key={tag}
              variant="sage"
              size="md"
              className={
                isDesktop ? "" : "hover:bg-card-bg/20 hover:scale-105 transition-all duration-200"
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <ReviewGallery images={review.images || []} isDesktop={isDesktop} />
    </>
  );
}
