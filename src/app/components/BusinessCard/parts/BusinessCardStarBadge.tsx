"use client";

import { useMemo } from "react";

interface BusinessCardStarBadgeProps {
  displayRating: number | undefined;
  hideStar?: boolean;
  hasRating: boolean;
  index: number;
  businessId: string;
}

export default function BusinessCardStarBadge({
  displayRating,
  hideStar = false,
  hasRating,
  index,
  businessId,
}: BusinessCardStarBadgeProps) {
  const starGradientId = useMemo(() => {
    if (!displayRating) return null;
    return displayRating > 4.0 ? 'Gold' : displayRating > 2.0 ? 'Bronze' : 'Low';
  }, [displayRating]);

  const gradientSuffix = businessId ?? index;

  if (hideStar) return null;

  if (hasRating && displayRating !== undefined) {
    return (
      <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-3 py-1.5 text-charcoal">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="rounded-full p-1"
          aria-hidden
        >
          <defs>
            {starGradientId === 'Gold' && (
              <linearGradient
                id={`starGradient${starGradientId}-${gradientSuffix}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" style={{ stopColor: '#F5D547', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#E6A547', stopOpacity: 1 }} />
              </linearGradient>
            )}
            {starGradientId === 'Bronze' && (
              <linearGradient
                id={`starGradient${starGradientId}-${gradientSuffix}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" style={{ stopColor: '#D4915C', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8B6439', stopOpacity: 1 }} />
              </linearGradient>
            )}
            {starGradientId === 'Low' && (
              <linearGradient
                id={`starGradient${starGradientId}-${gradientSuffix}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" style={{ stopColor: '#D66B6B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#6B5C5C', stopOpacity: 1 }} />
              </linearGradient>
            )}
          </defs>
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={`url(#starGradient${starGradientId}-${gradientSuffix})`}
            stroke={`url(#starGradient${starGradientId}-${gradientSuffix})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="text-sm font-semibold text-charcoal"
          style={{
            fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontWeight: 600,
          }}
        >
          {Number(displayRating).toFixed(1)}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-off-white/95 backdrop-blur-xl px-3 py-1.5 text-charcoal shadow-md">
      <span
        className="text-sm font-semibold text-charcoal"
        style={{
          fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          fontWeight: 600,
        }}
      >
        New
      </span>
    </div>
  );
}
