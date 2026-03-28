"use client";

import { Edit, Trash2 } from "@/app/lib/icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { getInitials } from "../../atoms/Avatar/Avatar";
import type { ReviewWithUser } from "../../../lib/types/database";
import BadgePill, { BadgePillData } from "../../Badges/BadgePill";
import VerifiedBadge from "../../VerifiedBadge/VerifiedBadge";
import { Badge } from "@/app/components/ui/badge";
import { getDisplayUsername } from "../../../utils/generateUsername";

interface ReviewHeaderProps {
  review: ReviewWithUser;
  userBadges: BadgePillData[];
  rating: number;
  isDesktop: boolean;
  isOwner: boolean;
  isAnonymous: boolean;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (dateString: string) => string;
}

export function ReviewHeader({
  review,
  userBadges,
  rating,
  isDesktop,
  isOwner,
  isAnonymous,
  onEdit,
  onDelete,
  formatDate,
}: ReviewHeaderProps) {
  return (
    <div className="flex items-start space-x-4">
      {/* Avatar */}
      <div
        className={`flex-shrink-0 ${isDesktop ? "" : "transition-transform duration-300 hover:scale-110 hover:rotate-[5deg]"}`}
      >
        {(() => {
          const displayName =
            review.user?.name ||
            getDisplayUsername(
              review.user?.username,
              review.user?.display_name,
              review.user?.email,
              review.user_id
            );
          const src = review.user.avatar_url?.trim() || undefined;
          return (
            <div className="w-12 h-12 rounded-full p-0.5 bg-off-white ring-2 ring-white/40">
              <Avatar
                className={`w-full h-full ${isDesktop ? "" : "group-hover:ring-2 group-hover:ring-sage/40 transition-all duration-300"}`}
              >
                {src && <AvatarImage src={src} alt={displayName} />}
                <AvatarFallback
                  delayMs={src ? 200 : 0}
                  className="bg-gradient-to-br from-sage/20 to-sage/10 font-urbanist text-lg font-bold text-sage"
                >
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </div>
          );
        })()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 space-y-2 md:space-y-0">
          <div className="flex min-w-0 items-start sm:items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex min-w-0 flex-nowrap items-center gap-2">
                <span
                  className={`min-w-0 truncate font-urbanist text-lg font-600 leading-tight text-charcoal-700 ${
                    isDesktop ? "" : "transition-colors duration-300 group-hover:text-sage"
                  }`}
                  title={
                    review.user?.name ||
                    getDisplayUsername(
                      review.user?.username,
                      review.user?.display_name,
                      review.user?.email,
                      review.user_id
                    )
                  }
                >
                  {review.user?.name ||
                    getDisplayUsername(
                      review.user?.username,
                      review.user?.display_name,
                      review.user?.email,
                      review.user_id
                    )}
                </span>
                {isAnonymous ? (
                  <Badge
                    variant="neutral"
                    size="sm"
                    className="flex-shrink-0 bg-charcoal/12 text-charcoal/75 border-transparent"
                  >
                    Anonymous
                  </Badge>
                ) : (
                  <span className="inline-flex flex-shrink-0 items-center">
                    <VerifiedBadge size="sm" />
                  </span>
                )}
              </div>
              {userBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {userBadges.slice(0, 3).map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex origin-left scale-[1.03] rounded-full shadow-premium-sm sm:scale-100"
                    >
                      <BadgePill badge={badge} size="sm" />
                    </span>
                  ))}
                  {userBadges.length > 3 && (
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="text-[10px] font-bold text-charcoal/60 border-charcoal/15 bg-charcoal/10 shadow-premium-sm"
                    >
                      +{userBadges.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-start justify-end gap-2 sm:gap-3">
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center space-x-1">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="reviewCardGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5D547" />
                      <stop offset="100%" stopColor="#E6A547" />
                    </linearGradient>
                  </defs>
                </svg>
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <svg className="w-5 h-5 sm:w-5 sm:h-5" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        fill={i < rating ? "url(#reviewCardGoldStar)" : "none"}
                        stroke={i < rating ? "url(#reviewCardGoldStar)" : "#9ca3af"}
                        strokeWidth={i < rating ? 0 : 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <span className="font-urbanist text-xs sm:text-sm font-600 text-charcoal/60">
                {formatDate(review.created_at)}
              </span>
            </div>

            {isOwner && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={onEdit}
                  className="min-w-[44px] min-h-[44px] sm:min-w-[28px] sm:min-h-[28px] w-11 h-11 sm:w-7 sm:h-7 bg-navbar-bg rounded-full flex items-center justify-center active:scale-95 hover:scale-110 hover:bg-navbar-bg/90 transition-all duration-200 touch-manipulation"
                  aria-label="Edit review"
                  title="Edit review"
                >
                  <Edit className="w-5 h-5 sm:w-[18px] sm:h-[18px] text-white" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="min-w-[44px] min-h-[44px] sm:min-w-[28px] sm:min-h-[28px] w-11 h-11 sm:w-7 sm:h-7 bg-navbar-bg rounded-full flex items-center justify-center active:scale-95 hover:scale-110 hover:bg-navbar-bg/90 transition-all duration-200 touch-manipulation"
                  aria-label="Delete review"
                  title="Delete review"
                >
                  <Trash2 className="w-5 h-5 sm:w-[18px] sm:h-[18px] text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
