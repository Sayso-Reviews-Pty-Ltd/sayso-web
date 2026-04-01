"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useUserBadgesById } from "../../hooks/useUserBadges";
import { Review, Reviewer } from "../../types/community";
import { useAuth } from "../../contexts/AuthContext";
import ProfilePicture from "./ProfilePicture";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { BadgePillData } from "../Badges/BadgePill";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

import { Star, User, Heart, ChevronRight, MapPin } from "@/app/lib/icons";
import { RAIL_CARD_RADIUS } from "../HomeSectionRow/cardDimensions";

interface ReviewerCardProps {
  review?: Review;
  reviewer?: Reviewer;
  latestReview?: Review;
  variant?: "reviewer" | "review";
  index?: number;
}

const REVIEWER_CARD_WIDTH = "w-full sm:w-[220px] md:w-[300px]";

const getBadgeVariant = (group?: string): "info" | "warning" | "success" | "coral" | "neutral" => {
  if (group === "explorer") return "info";
  if (group === "milestone") return "warning";
  if (group === "community") return "success";
  if (group === "specialist") return "coral";
  return "neutral";
};

export default function ReviewerCard({
  review,
  reviewer,
  latestReview,
  variant = "review",
}: ReviewerCardProps) {
  const { user: currentUser } = useAuth();
  const reviewerData = reviewer || review?.reviewer;
  const userIdForBadges = reviewerData?.id ?? (review as any)?.user?.id;

  const reviewerUserId = reviewerData?.id || (review as any)?.user?.id || "";
  const isOwnCard = currentUser?.id === reviewerUserId && !!currentUser?.id;
  const cardHref = isOwnCard ? "/profile" : `/reviewer/${reviewerUserId}`;
  const idForSnap = useMemo(
    () => `reviewer-${reviewerData?.id ?? userIdForBadges}`,
    [reviewerData?.id, userIdForBadges]
  );

  const MAX_VISIBLE_BADGES = 2;
  const propBadges = reviewerData?.badges;

  const { badges: fetchedBadges } = useUserBadgesById(
    propBadges && propBadges.length > 0 ? null : (userIdForBadges ?? null)
  );

  const userBadges: BadgePillData[] =
    propBadges && propBadges.length > 0
      ? [...propBadges].filter(Boolean).sort((a, b) => {
          const order = ["milestone", "specialist", "explorer", "community"];
          return order.indexOf(a.badge_group || "") - order.indexOf(b.badge_group || "");
        })
      : fetchedBadges.filter(Boolean);

  const visibleBadges = userBadges.slice(0, MAX_VISIBLE_BADGES);
  const overflowCount = Math.max(0, userBadges.length - MAX_VISIBLE_BADGES);
  const isTopReviewer = reviewerData?.badge === "top";
  const isVerified = reviewerData?.badge === "verified";

  const renderStars = (rating: number, iconSize = "w-3 h-3") => (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i <= Math.round(rating) ? "fill-coral text-coral" : "fill-charcoal/10 text-charcoal/10"
          }`}
        />
      ))}
    </div>
  );

  // ─── REVIEWER VARIANT ──────────────────────────────────────────────────────
  if (variant === "reviewer" || reviewer) {
    return (
      <div
        id={idForSnap}
        className={`snap-center snap-always ${REVIEWER_CARD_WIDTH} flex-shrink-0 h-full`}
      >
        <Link href={cardHref} className="block group/card h-full">
          <Card
            className={cn(
              "relative overflow-hidden shadow-md h-full flex flex-col cursor-pointer font-urbanist border-none gap-0 p-0",
              RAIL_CARD_RADIUS,
              isTopReviewer ? "bg-[#1c1712]" : "bg-card-bg"
            )}
          >
            {isTopReviewer && (
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent pointer-events-none" />
            )}

            <CardContent className="relative p-3 flex flex-col gap-2.5 h-full">
              {/* ── IDENTITY ROW ── */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  {isTopReviewer && (
                    <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-coral opacity-80 blur-[4px]" />
                  )}
                  <Avatar className="w-10 h-10 shadow-sm">
                    <AvatarImage
                      src={reviewerData?.profilePicture || ""}
                      alt={reviewerData?.name || "Reviewer"}
                    />
                    <AvatarFallback
                      className={cn(
                        isTopReviewer
                          ? "bg-gradient-to-br from-amber-900/60 to-orange-900/40"
                          : "bg-gradient-to-br from-sage/25 to-coral/15"
                      )}
                    >
                      <User
                        className={isTopReviewer ? "text-amber-300/50" : "text-charcoal/40"}
                        size={16}
                        strokeWidth={1.8}
                      />
                    </AvatarFallback>
                  </Avatar>

                  {isVerified && (
                    <div className="absolute -right-0.5 -bottom-0.5 z-20">
                      <div className="bg-white rounded-full p-[2px] shadow-sm">
                        <VerifiedBadge size="sm" />
                      </div>
                    </div>
                  )}
                  {isTopReviewer && (
                    <div className="absolute -right-0.5 -bottom-0.5 z-20 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-[#1c1712] shadow-sm">
                      <Star className="w-2 h-2 fill-white text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-[14px] font-bold truncate leading-tight tracking-[-0.02em] ${
                      isTopReviewer ? "text-amber-100" : "text-charcoal"
                    }`}
                  >
                    {reviewerData?.name}
                  </h3>

                  {isTopReviewer ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400/80 mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      Top Reviewer
                    </span>
                  ) : reviewerData?.location ? (
                    <p className="flex items-center gap-1 text-[11px] text-charcoal/45 font-medium mt-0.5 truncate">
                      <span className="inline-flex items-center justify-center bg-off-white/90 rounded-full p-0.5 flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </span>
                      {reviewerData.location}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* ── SOCIAL PROOF STATS ── */}
              <style>{`
                @keyframes stat-tick {
                  0%   { transform: translateY(14px); opacity: 0; }
                  100% { transform: translateY(0);    opacity: 1; }
                }
                .stat-tick { display: inline-block; animation: stat-tick 0.45s cubic-bezier(0.22,1,0.36,1) both; }
              `}</style>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: reviewerData?.reviewCount ?? 0, label: "Reviews", delay: "0ms" },
                  {
                    value:
                      reviewerData?.avgRatingGiven != null
                        ? reviewerData.avgRatingGiven.toFixed(1)
                        : "—",
                    label: "Avg ★",
                    delay: "120ms",
                  },
                  { value: reviewerData?.helpfulVotes ?? 0, label: "Helpful", delay: "240ms" },
                ].map(({ value, label, delay }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center px-1.5 py-1.5 rounded-lg overflow-hidden border ${
                      isTopReviewer
                        ? "bg-amber-950/40 border-amber-400/[0.12]"
                        : "bg-off-white/70 border-charcoal/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    <span
                      className={`stat-tick text-[18px] font-black leading-none tracking-tight ${
                        isTopReviewer ? "text-amber-300" : "text-charcoal"
                      }`}
                      style={{ animationDelay: delay }}
                    >
                      {value}
                    </span>
                    <span
                      className={`text-[8px] font-semibold uppercase tracking-[0.08em] mt-0 ${
                        isTopReviewer ? "text-amber-400/45" : "text-charcoal/40"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── BADGES ── */}
              {visibleBadges.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {visibleBadges.map((badge) => (
                    <Badge key={badge.id} variant={getBadgeVariant(badge.badge_group)} size="sm">
                      {badge.name}
                    </Badge>
                  ))}
                  {overflowCount > 0 && (
                    <Badge variant="neutral" size="sm">
                      +{overflowCount}
                    </Badge>
                  )}
                </div>
              )}

              {/* ── LATEST REVIEW SNIPPET ── */}
              {latestReview && (
                <div
                  className={`rounded-xl px-2.5 py-2 relative overflow-hidden border ${
                    isTopReviewer
                      ? "bg-amber-950/25 border-amber-400/[0.08]"
                      : "bg-off-white/50 border-charcoal/[0.06]"
                  }`}
                >
                  <span
                    className={`absolute -top-1 -right-1 text-[40px] leading-none font-serif select-none pointer-events-none ${
                      isTopReviewer ? "text-amber-400/[0.08]" : "text-charcoal/[0.05]"
                    }`}
                  >
                    &rdquo;
                  </span>
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="0" height="0" className="absolute overflow-hidden">
                      <defs>
                        <linearGradient id="reviewerStarGold" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex gap-[2px]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5"
                          style={
                            i <= Math.round((latestReview as any)?.rating ?? 5)
                              ? { fill: "url(#reviewerStarGold)", color: "#f59e0b" }
                              : { fill: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.1)" }
                          }
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${
                        isTopReviewer ? "text-amber-400/35" : "text-charcoal/35"
                      }`}
                    >
                      Latest
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-snug line-clamp-2 font-medium italic tracking-tight ${
                      isTopReviewer ? "text-amber-100/45" : "text-charcoal/60"
                    }`}
                  >
                    {latestReview.reviewText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  // ─── REVIEW CARD VARIANT ──────────────────────────────────────────────────
  const reviewRating = (review as any)?.rating ?? null;

  return (
    <div className="w-[calc(50vw-12px)] sm:w-auto sm:min-w-[213px] flex-shrink-0">
      <Link href={cardHref} className="block group/card">
        <Card className="bg-card-bg rounded-2xl cursor-pointer h-[187px] flex flex-col relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-out group-hover/card:-translate-y-1 font-urbanist border-none gap-0 p-0">
          <div className="h-[3px] w-full bg-gradient-to-r from-coral/50 via-sage/50 to-coral/30 flex-shrink-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-sage/[0.03] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-card-bg to-transparent pointer-events-none z-10 rounded-b-2xl" />

          <CardContent className="flex-1 flex flex-col px-2.5 pt-2 pb-2.5 gap-1.5">
            {reviewRating != null && (
              <div className="flex items-center gap-1.5">
                {renderStars(reviewRating)}
                <span className="text-[10px] text-charcoal/35 font-bold tabular-nums">
                  {Number(reviewRating).toFixed(1)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <ProfilePicture
                  src={review?.reviewer.profilePicture || ""}
                  alt={review?.reviewer.name || ""}
                  size="sm"
                  badge={review?.reviewer.badge}
                />
                {review?.reviewer.badge === "verified" && (
                  <div className="absolute -right-0.5 -top-0.5 z-20">
                    <VerifiedBadge size="sm" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-charcoal truncate leading-tight tracking-[-0.01em]">
                  {review?.reviewer.name}
                </h3>
                <span className="text-[10px] text-charcoal/38 font-medium">
                  {review?.reviewer.reviewCount || 0} reviews
                </span>
              </div>
            </div>

            {visibleBadges.length > 0 && (
              <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                {visibleBadges.map((badge) => (
                  <Badge key={badge.id} variant={getBadgeVariant(badge.badge_group)} size="sm">
                    {badge.name}
                  </Badge>
                ))}
                {overflowCount > 0 && (
                  <Badge variant="neutral" size="sm">
                    +{overflowCount}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col justify-between">
              <div>
                {review?.businessName && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin className="w-2.5 h-2.5 text-charcoal/28 flex-shrink-0" />
                    <p className="text-[10px] font-semibold text-charcoal/42 truncate">
                      {review.businessName}
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-charcoal/68 leading-snug line-clamp-2 font-medium italic">
                  {review?.reviewText ? `"${review.reviewText}"` : ""}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-charcoal/28 font-medium">
                  {review?.date || ""}
                </span>
                <div className="flex items-center gap-2">
                  {(review?.likes ?? 0) > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 fill-coral/65 text-coral/65" />
                      <span className="text-[10px] font-semibold text-charcoal/38">
                        {review?.likes}
                      </span>
                    </div>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal/20 -translate-x-1 opacity-0 group-hover/card:translate-x-0 group-hover/card:opacity-100 transition-all duration-200" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
