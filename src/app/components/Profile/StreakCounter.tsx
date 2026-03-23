'use client';

import { m } from 'framer-motion';
import { useUserStreak } from '@/app/hooks/useUserStreak';

interface StreakCounterProps {
  compact?: boolean;
}

export default function StreakCounter({ compact = false }: StreakCounterProps) {
  const streak = useUserStreak();

  if (streak.isLoading) {
    return (
      <div className={`animate-pulse rounded-full bg-charcoal/10 ${compact ? 'h-5 w-20' : 'h-6 w-32'}`} />
    );
  }

  if (streak.error || streak.currentStreak === 0) return null;

  const isPulsing = streak.currentStreak >= 3;

  return (
    <div className={`flex items-center gap-2 font-urbanist ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Fire icon */}
      <m.span
        animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
        transition={isPulsing ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } : {}}
        className="text-base leading-none select-none"
        aria-hidden
      >
        🔥
      </m.span>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-700 text-charcoal leading-none">
            {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
          </span>

          {streak.shieldActive && (
            <span
              title="Streak shield active — miss one day safely"
              className="text-xs leading-none select-none"
              aria-label="Streak shield active"
            >
              🛡️
            </span>
          )}

          {streak.isPersonalBest && (
            <span className="text-[10px] font-600 text-navbar-bg leading-none">
              Personal best!
            </span>
          )}
        </div>

        {/* Progress to next milestone */}
        {!compact && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-[72px] rounded-full bg-charcoal/10 overflow-hidden">
              <m.div
                className="h-full rounded-full bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${streak.percentToMilestone}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-charcoal/50 leading-none">
              {streak.nextMilestone}d
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
