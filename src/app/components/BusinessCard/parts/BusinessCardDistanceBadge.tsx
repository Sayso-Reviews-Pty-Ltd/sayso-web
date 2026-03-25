"use client";

interface BusinessCardDistanceBadgeProps {
  distanceBadgeText: string | null;
  distanceHint: string | null;
}

export default function BusinessCardDistanceBadge({
  distanceBadgeText,
  distanceHint,
}: BusinessCardDistanceBadgeProps) {
  if (!distanceBadgeText) return null;

  return (
    <div className="absolute left-4 bottom-4 z-20 inline-flex items-center rounded-full bg-off-white/90 backdrop-blur-[2px] px-2.5 py-1 text-[11px] font-medium text-charcoal shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
      <span
        className="leading-none"
        style={{
          fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        }}
        title={distanceHint ?? distanceBadgeText}
      >
        {distanceBadgeText}
      </span>
    </div>
  );
}
