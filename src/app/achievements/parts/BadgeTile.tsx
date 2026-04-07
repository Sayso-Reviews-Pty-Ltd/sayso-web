"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { Lock, Star } from "@/app/lib/icons";
import type { Badge } from "@/app/components/Badges/BadgeCard";
import { BADGE_MAPPINGS } from "@/app/lib/badgeMappings";

export function BadgeTile({ badge, onClick }: { badge: Badge; onClick: () => void }) {
  const isLocked = !badge.earned;
  const mapping = BADGE_MAPPINGS[badge.id];
  const pngPath = mapping?.pngPath || badge.icon_path || "/badges/012-expertise.png";

  return (
    <m.button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border text-left w-full aspect-square
        ${isLocked ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10 shadow-lg"}
        hover:scale-105 active:scale-95 transition-transform cursor-pointer`}
      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Shine sweep on earned */}
      {!isLocked && (
        <m.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
        />
      )}

      <div className="relative w-14 h-14 mb-3 flex-shrink-0">
        <Image
          src={pngPath}
          alt={badge.name}
          fill
          className={`object-contain ${isLocked ? "grayscale opacity-35" : ""}`}
          unoptimized
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
              <Lock className="w-3 h-3 text-white/70" />
            </div>
          </div>
        )}
        {!isLocked && (
          <m.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
          >
            <Star className="w-2.5 h-2.5 text-amber-900 fill-amber-900" />
          </m.div>
        )}
      </div>

      <p
        className={`font-urbanist font-700 text-xs text-center leading-tight
        ${isLocked ? "text-white/40" : "text-white"}`}
      >
        {badge.name}
      </p>
    </m.button>
  );
}
