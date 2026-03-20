'use client';

import { m } from 'framer-motion';
import type { ReviewWithUser } from '../../../lib/types/database';
import { ReviewGallery } from '../ReviewGallery';

interface ReviewContentProps {
  review: ReviewWithUser;
  showBusinessInfo: boolean;
  isDesktop: boolean;
}

export function ReviewContent({
  review,
  showBusinessInfo,
  isDesktop,
}: ReviewContentProps) {
  return (
    <>
      {/* Review Title */}
      {review.title && (
        <h4
          className={`font-urbanist text-xl font-600 text-charcoal mb-2 ${
            isDesktop ? '' : 'group-hover:text-sage transition-colors duration-300'
          }`}
        >
          {review.title}
        </h4>
      )}

      {/* Business Info (if showing) */}
      {showBusinessInfo && 'business' in review && (
        <div className="mb-3 p-2 bg-card-bg/10 rounded-lg">
          <span className="font-urbanist text-sm font-500 text-sage">
            Review for: {(review as ReviewWithUser & { business: { name: string } }).business?.name}
          </span>
        </div>
      )}

      {/* Review Text */}
      <p className="font-urbanist text-base font-600 text-charcoal/90 leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag) => (
            <m.span
              key={tag}
              whileHover={isDesktop ? undefined : { scale: 1.05 }}
              className={`inline-flex items-center px-3 py-1 bg-card-bg/10 text-sage text-sm font-500 rounded-full border border-sage/20 ${
                isDesktop ? '' : 'hover:bg-card-bg/20 transition-colors duration-300'
              }`}
            >
              {tag}
            </m.span>
          ))}
        </div>
      )}

      {/* Images */}
      <ReviewGallery images={review.images || []} isDesktop={isDesktop} />
    </>
  );
}
