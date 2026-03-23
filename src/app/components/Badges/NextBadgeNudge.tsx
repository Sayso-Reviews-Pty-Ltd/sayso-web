'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { useNextBadgeProgress } from '@/app/hooks/useNextBadgeProgress';

interface NextBadgeNudgeProps {
  userId:   string | undefined;
  compact?: boolean;
  theme?:   'light' | 'dark';
}

export default function NextBadgeNudge({ userId, compact = false, theme = 'light' }: NextBadgeNudgeProps) {
  const { nearestBadges, isLoading } = useNextBadgeProgress(userId);
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg shrink-0 ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
            <div className="flex-1 space-y-1.5">
              <div className={`h-2.5 w-24 rounded ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
              <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-charcoal/10'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nearestBadges.length === 0) return null;

  return (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-4'}`}>
      {nearestBadges.map((badge, idx) => (
        <m.div
          key={badge.badgeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.22, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          {/* Locked badge icon */}
          <div className={`relative shrink-0 h-9 w-9 ${isDark ? 'opacity-65 brightness-110' : 'grayscale opacity-50'}`}>
            <Image
              src={badge.iconPath}
              alt={badge.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Label */}
            <p className={`font-urbanist text-xs font-600 leading-tight truncate ${isDark ? 'text-white/85' : 'text-charcoal'}`}>
              {badge.remaining} more {badge.actionLabel} to unlock{' '}
              <span className={isDark ? 'text-amber-300' : 'text-navbar-bg'}>{badge.name}</span>
            </p>

            {/* Progress bar */}
            <div className={`mt-1 h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/15 ring-1 ring-white/15' : 'bg-charcoal/10'}`}>
              <m.div
                className={`h-full rounded-full ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]'
                    : 'bg-navbar-bg'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${badge.percent > 0 ? Math.max(badge.percent, 6) : 0}%` }}
                transition={{ duration: 0.5, delay: idx * 0.06 + 0.1, ease: 'easeOut' }}
              />
            </div>

            {!compact && (
              <p className={`mt-0.5 font-urbanist text-[10px] leading-none ${isDark ? 'text-white/60' : 'text-charcoal/50'}`}>
                {badge.current} / {badge.required}
              </p>
            )}
          </div>
        </m.div>
      ))}
    </div>
  );
}
