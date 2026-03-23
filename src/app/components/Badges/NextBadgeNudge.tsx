'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { useNextBadgeProgress } from '@/app/hooks/useNextBadgeProgress';

interface NextBadgeNudgeProps {
  userId:   string | undefined;
  compact?: boolean;
}

export default function NextBadgeNudge({ userId, compact = false }: NextBadgeNudgeProps) {
  const { nearestBadges, isLoading } = useNextBadgeProgress(userId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-charcoal/10 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-24 rounded bg-charcoal/10" />
              <div className="h-2 w-full rounded-full bg-charcoal/10" />
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
          <div className="relative shrink-0 h-9 w-9 grayscale opacity-50">
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
            <p className="font-urbanist text-xs font-600 text-charcoal leading-tight truncate">
              {badge.remaining} more {badge.actionLabel} to unlock{' '}
              <span className="text-navbar-bg">{badge.name}</span>
            </p>

            {/* Progress bar */}
            <div className="mt-1 h-1.5 w-full rounded-full bg-charcoal/10 overflow-hidden">
              <m.div
                className="h-full rounded-full bg-navbar-bg"
                initial={{ width: 0 }}
                animate={{ width: `${badge.percent}%` }}
                transition={{ duration: 0.5, delay: idx * 0.06 + 0.1, ease: 'easeOut' }}
              />
            </div>

            {!compact && (
              <p className="mt-0.5 font-urbanist text-[10px] text-charcoal/50 leading-none">
                {badge.current} / {badge.required}
              </p>
            )}
          </div>
        </m.div>
      ))}
    </div>
  );
}
