'use client';

import { m } from 'framer-motion';
import { useUserXP } from '@/app/hooks/useUserXP';
import { LEVEL_PERKS, nextPerkAt } from '@/app/lib/xp/levels';

interface XPBarProps {
  userId?: string;
  compact?: boolean;
}

export default function XPBar({ compact = false }: XPBarProps) {
  const xp = useUserXP();

  if (xp.isLoading) {
    return (
      <div className={`animate-pulse rounded-full bg-charcoal/10 ${compact ? 'h-5 w-32' : 'h-6 w-48'}`} />
    );
  }

  if (xp.error) return null;

  const perk = nextPerkAt(xp.level);
  const currentPerk = LEVEL_PERKS[xp.level] ?? null;

  return (
    <div
      className={`flex items-center gap-2 font-urbanist ${compact ? 'text-xs' : 'text-sm'}`}
      title={perk ? `Next perk at Level ${perk.level}: ${perk.perk}` : 'Max level reached'}
    >
      {/* Level badge */}
      <span className="inline-flex items-center justify-center rounded-full bg-navbar-bg text-white font-700 leading-none px-2 py-0.5 text-[11px] shrink-0">
        Lv {xp.level}
      </span>

      {/* Progress bar */}
      <div className="flex-1 min-w-[60px] max-w-[120px]">
        <div className="h-1.5 w-full rounded-full bg-charcoal/10 overflow-hidden">
          <m.div
            className="h-full rounded-full bg-navbar-bg"
            initial={{ width: 0 }}
            animate={{ width: `${xp.percentToNext}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {!compact && (
          <p className="mt-0.5 text-[10px] text-charcoal/50 leading-none">
            {xp.xpIntoCurrentLevel} / {xp.xpToNextLevel} XP
          </p>
        )}
      </div>

      {/* Current perk label (non-compact only) */}
      {!compact && currentPerk && (
        <span className="text-[10px] text-charcoal/50 hidden sm:block truncate max-w-[100px]">
          {currentPerk}
        </span>
      )}
    </div>
  );
}
