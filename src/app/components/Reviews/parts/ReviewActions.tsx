"use client";

import { Heart, MessageCircle, Flag, Loader2 } from "@/app/lib/icons";
import type { AuthUser } from "../../../lib/types/database";

interface ReviewActionsProps {
  isDesktop: boolean;
  isOwner: boolean;
  isOwnerView: boolean;
  isLiked: boolean;
  helpfulCount: number;
  loadingHelpful: boolean;
  onLike: () => Promise<void>;
  user: AuthUser | null;
  showReplyForm: boolean;
  onToggleReplyForm: () => void;
  replyCount: number;
  onOpenMessageModal: () => void;
  isFlagged: boolean;
  isFlagging: boolean;
  isCheckingFlag: boolean;
  onOpenFlagModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  reportButtonDisabled: boolean;
}

export function ReviewActions({
  isDesktop,
  isOwner,
  isOwnerView,
  isLiked,
  helpfulCount,
  loadingHelpful,
  onLike,
  user,
  showReplyForm,
  onToggleReplyForm,
  replyCount,
  onOpenMessageModal,
  isFlagged,
  isFlagging,
  isCheckingFlag,
  onOpenFlagModal,
  reportButtonDisabled,
}: ReviewActionsProps) {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-sage/10 gap-2">
      <div className="flex items-center gap-3">
        {!isOwnerView && (
          <button
            type="button"
            onClick={() => void onLike()}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 active:scale-95 ${
              isLiked
                ? "bg-card-bg/10 text-sage"
                : "text-charcoal/60 hover:bg-card-bg/10 hover:text-sage"
            } ${loadingHelpful ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={!user || loadingHelpful}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="font-urbanist text-sm font-500">Helpful ({helpfulCount})</span>
          </button>
        )}

        {user && (
          <button
            type="button"
            onClick={onToggleReplyForm}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full font-semibold transition-all duration-200 active:scale-95 ${
              isOwnerView
                ? "bg-card-bg text-white hover:bg-card-bg/90 px-4"
                : "text-charcoal/60 hover:bg-card-bg/10 hover:text-sage"
            }`}
          >
            <MessageCircle size={isOwnerView ? 16 : 18} />
            <span className="font-urbanist text-sm">
              Reply{replyCount > 0 ? ` (${replyCount})` : ""}
            </span>
          </button>
        )}

        {isOwnerView && user && (
          <button
            type="button"
            onClick={onOpenMessageModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-coral text-white font-semibold transition-all duration-200 active:scale-95 hover:bg-coral/90"
          >
            <MessageCircle size={16} />
            <span className="font-urbanist text-sm">Message Customer</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {!user && !isOwnerView && (
          <span className="font-urbanist text-sm sm:text-xs text-charcoal/60">
            Login to interact
          </span>
        )}

        {user && !isOwner && (
          <button
            type="button"
            onClick={onOpenFlagModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
              }
            }}
            disabled={reportButtonDisabled}
            aria-label="Report review"
            title={isFlagged ? "Review already reported" : "Report review"}
            className={`inline-flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full touch-manipulation transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-off-white ${
              isFlagged
                ? "text-red-500 bg-red-50/70 cursor-not-allowed"
                : "text-charcoal/50 hover:text-red-500 hover:bg-red-50/70"
            } ${reportButtonDisabled && !isFlagged ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isFlagging || isCheckingFlag ? (
              <Loader2 className="w-[18px] h-[18px] sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Flag className="w-[18px] h-[18px] sm:w-4 sm:h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
