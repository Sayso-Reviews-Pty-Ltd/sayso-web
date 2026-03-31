"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { Award } from "@/app/lib/icons";

interface ReviewerBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  badge_group?: string;
}

interface ReviewerBadgesSectionProps {
  badges: ReviewerBadge[];
}

export default function ReviewerBadgesSection({ badges }: ReviewerBadgesSectionProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <section
      className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8"
      aria-label="Reviewer badges"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
            <Award className="w-4 h-4 text-charcoal/85" />
          </span>
          <h3 className="text-base font-semibold text-charcoal">
            Badges & Achievements ({badges.length})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge, idx) => (
          <m.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.05, y: -3 }}
            className="cursor-default transition-all duration-300 bg-off-white/70 rounded-xl ring-1 ring-black/5 shadow-sm hover:shadow-lg p-3 flex flex-col items-center text-center gap-1.5"
          >
            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
              <Image
                src={badge.icon}
                alt={badge.name}
                width={48}
                height={48}
                sizes="(max-width: 640px) 40px, 48px"
                className="h-10 w-10 object-contain drop-shadow-sm sm:h-12 sm:w-12"
                unoptimized
              />
            </div>
            <h4 className="line-clamp-1 text-[10px] font-bold leading-tight text-charcoal/95 sm:text-[11px]">
              {badge.name}
            </h4>
            <p className="line-clamp-2 text-[9px] leading-tight text-charcoal/75 sm:text-[10px]">
              {badge.description}
            </p>
          </m.div>
        ))}
      </div>
    </section>
  );
}
