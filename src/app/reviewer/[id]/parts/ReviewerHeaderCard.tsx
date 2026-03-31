"use client";

import Image from "next/image";
import { Award, Calendar, Check, MapPin, Star, User } from "@/app/lib/icons";
import { Badge } from "@/app/components/ui/badge";
import { LiveIndicator } from "@/app/components/Realtime/RealtimeIndicators";

interface ReviewerHeaderCardProps {
  name: string;
  profilePicture: string;
  badge?: "top" | "verified" | "local";
  trophyBadge?: "gold" | "silver" | "bronze" | "rising-star" | "community-favorite";
  location: string;
  memberSince: string;
  averageRating: number;
  reviewCount: number;
  imgError: boolean;
  isRealtimeConnected: boolean;
  onImgError: () => void;
}

export default function ReviewerHeaderCard({
  name,
  profilePicture,
  badge,
  trophyBadge,
  location,
  memberSince,
  averageRating,
  reviewCount,
  imgError,
  isRealtimeConnected,
  onImgError,
}: ReviewerHeaderCardProps) {
  return (
    <article className="w-full sm:mx-0" aria-labelledby="profile-heading">
      <div className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sage/10 to-transparent rounded-full blur-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-coral/10 to-transparent rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {!imgError && profilePicture && profilePicture.trim() !== "" ? (
                <div className="relative">
                  <Image
                    src={profilePicture}
                    alt={name}
                    width={120}
                    height={120}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full shadow-xl"
                    priority
                    onError={onImgError}
                  />
                  {(badge === "verified" || badge === "top") && (
                    <div className="absolute -bottom-1 -right-1 z-20">
                      <div className="w-8 h-8 bg-card-bg rounded-full flex items-center justify-center ring-4 ring-white">
                        <Check className="text-white" size={14} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-off-white/80 rounded-full shadow-xl">
                  <User className="text-charcoal/80" size={44} strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2
                  id="profile-heading"
                  className="text-h1 sm:text-hero font-semibold text-charcoal"
                >
                  {name}
                </h2>
                {trophyBadge && (
                  <Badge
                    variant="sage"
                    size="sm"
                    className="bg-card-bg/20 border-transparent capitalize"
                  >
                    <Award size={12} />
                    {trophyBadge.replace("-", " ")}
                  </Badge>
                )}
                {isRealtimeConnected && <LiveIndicator isLive={isRealtimeConnected} />}
              </div>

              <div className="flex items-center gap-3 mb-4 text-body-sm text-charcoal/70 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                    <MapPin className="w-3 h-3 text-charcoal/85" />
                  </span>
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                    <Calendar className="w-3 h-3 text-charcoal/85" />
                  </span>
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-coral text-coral" />
                  <span className="text-lg font-bold text-charcoal">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-body-sm text-charcoal/70">{reviewCount} reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
