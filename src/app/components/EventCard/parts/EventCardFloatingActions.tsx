'use client';

import { Edit, Bookmark, Share2 } from "@/app/lib/icons";

interface EventCardFloatingActionsProps {
  hasReviewed: boolean;
  isItemSaved: boolean;
  onWriteReview: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onBookmark: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onShare: (e: React.MouseEvent<HTMLButtonElement>) => void;
  eventTitle: string;
}

export function EventCardFloatingActions({
  hasReviewed,
  isItemSaved,
  onWriteReview,
  onBookmark,
  onShare,
  eventTitle,
}: EventCardFloatingActionsProps) {
  return (
    <div data-event-card-action className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2 transition-all duration-300 ease-out translate-x-12 opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
      <button
        type="button"
        className={`w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md active:translate-y-[1px] transform-gpu touch-manipulation select-none ${hasReviewed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95'}`}
        onClick={onWriteReview}
        disabled={hasReviewed}
        aria-label={hasReviewed ? `You have already reviewed ${eventTitle}` : `Write a review for ${eventTitle}`}
        title={hasReviewed ? 'Already reviewed' : 'Write a review'}
      >
        <Edit className={`w-4 h-4 ${hasReviewed ? 'text-charcoal/40' : 'text-charcoal/80'}`} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md transform-gpu touch-manipulation select-none"
        onClick={onBookmark}
        aria-label={isItemSaved ? `Remove from saved ${eventTitle}` : `Save ${eventTitle}`}
        title={isItemSaved ? 'Remove from saved' : 'Save'}
      >
        <Bookmark className={`w-4 h-4 ${isItemSaved ? 'text-charcoal/80 fill-charcoal/80' : 'text-charcoal/80'}`} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="w-10 h-10 bg-off-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-off-white/60 hover:scale-110 hover:text-charcoal/90 active:scale-95 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 shadow-md transform-gpu touch-manipulation select-none"
        onClick={onShare}
        aria-label={`Share ${eventTitle}`}
        title="Share"
      >
        <Share2 className="w-4 h-4 text-charcoal/80" strokeWidth={2.5} />
      </button>
    </div>
  );
}
