"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Award, ChevronRight } from "@/app/lib/icons";
import { getBadgePngPath } from "@/app/lib/badgeMappings";
import type { UserAchievement } from "@/app/hooks/useUserBadges";
import NextBadgeNudge from "@/app/components/Badges/NextBadgeNudge";

interface ProfileAchievementsProps {
  achievements: UserAchievement[];
  userId?: string;
}

export function ProfileAchievements({ achievements, userId }: ProfileAchievementsProps) {
  return (
    <section
      className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8"
      aria-label="Your badges and achievements"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
            <Award className="w-4 h-4 text-charcoal/85" />
          </span>
          <h3 className="text-base font-semibold text-charcoal">Badges</h3>
        </div>
        {achievements.length > 0 && (
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm font-semibold text-coral hover:text-charcoal transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-charcoal/60 text-sm">
            No badges earned yet. Start reviewing businesses to unlock badges!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {achievements.map((achievement, idx) => {
            const normalizedAchievementId =
              achievement?.achievement_id || (achievement as any)?.id || `badge-${idx}`;
            const normalizedAchievementMeta =
              achievement?.achievements && typeof achievement.achievements === "object"
                ? achievement.achievements
                : ({
                    name: (achievement as any)?.name || "Badge",
                    description: (achievement as any)?.description || "Earned badge",
                  } as { name: string; description: string | null });
            const correctPngPath = getBadgePngPath(normalizedAchievementId);
            return (
              <m.div
                key={normalizedAchievementId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="cursor-default transition-all duration-300 bg-off-white/70 rounded-xl ring-1 ring-black/5 shadow-sm hover:shadow-lg p-3 flex flex-col items-center justify-center text-center gap-1.5 aspect-square overflow-hidden"
              >
                <div className="relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                  <Image
                    src={correctPngPath}
                    alt={normalizedAchievementMeta.name}
                    width={40}
                    height={40}
                    sizes="(max-width: 640px) 36px, 40px"
                    className="h-9 w-9 object-contain drop-shadow-sm sm:h-10 sm:w-10"
                  />
                </div>
                <h4 className="line-clamp-1 text-[10px] font-bold leading-tight text-charcoal/95 sm:text-[11px]">
                  {normalizedAchievementMeta.name}
                </h4>
                <p className="line-clamp-2 text-[9px] leading-tight text-charcoal/75 sm:text-[10px]">
                  {normalizedAchievementMeta.description}
                </p>
              </m.div>
            );
          })}
        </div>
      )}

      {/* Next badge to unlock */}
      {userId && achievements.length > 0 && (
        <div className="mt-4">
          <NextBadgeNudge userId={userId} compact />
        </div>
      )}
    </section>
  );
}
