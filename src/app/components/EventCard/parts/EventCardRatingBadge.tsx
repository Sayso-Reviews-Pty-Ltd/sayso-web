"use client";

interface EventCardRatingBadgeProps {
  displayRating: number | undefined;
  starGradientId: string | null;
}

export function EventCardRatingBadge({ displayRating, starGradientId }: EventCardRatingBadgeProps) {
  if (!displayRating || !starGradientId) return null;

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
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={`url(#starGradient${starGradientId}Event)`}
          stroke={`url(#starGradient${starGradientId}Event)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-semibold text-charcoal font-urbanist">
        {Number(displayRating).toFixed(1)}
      </span>
    </div>
  );
}
