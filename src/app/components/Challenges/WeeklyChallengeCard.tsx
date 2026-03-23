'use client';

import { m } from 'framer-motion';
import type { WeeklyChallenge } from '@/app/hooks/useWeeklyChallenges';

interface WeeklyChallengeCardProps {
  challenge: WeeklyChallenge;
  index?: number;
}

function daysRemaining(endsAt: string): number {
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function WeeklyChallengeCard({ challenge, index = 0 }: WeeklyChallengeCardProps) {
  const pct      = challenge.target > 0
    ? Math.min(100, Math.round((challenge.userProgress / challenge.target) * 100))
    : 0;
  const visiblePct = pct > 0 ? Math.max(pct, 6) : 0;
  const daysLeft = daysRemaining(challenge.ends_at);

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.22, ease: 'easeOut' }}
      className={`rounded-xl border p-4 font-urbanist transition-colors ${
        challenge.completed
          ? 'bg-emerald-50/60 border-emerald-200/60'
          : 'bg-off-white/70 border-charcoal/8'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-700 text-charcoal leading-tight truncate">
            {challenge.title}
          </h4>
          <p className="text-xs text-charcoal/60 mt-0.5 leading-snug">
            {challenge.description}
          </p>
        </div>

        {challenge.completed ? (
          <span className="text-lg leading-none shrink-0" aria-label="Completed">✅</span>
        ) : (
          <span className="shrink-0 rounded-full bg-navbar-bg/10 text-navbar-bg text-[11px] font-700 px-2 py-0.5 leading-none whitespace-nowrap">
            +{challenge.reward_xp} XP
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-charcoal/15 overflow-hidden mb-1">
        <m.div
          className={`h-full rounded-full ${
            challenge.completed
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(251,191,36,0.35)]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${visiblePct}%` }}
          transition={{ duration: 0.5, delay: index * 0.07 + 0.15, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-charcoal/50">
          {challenge.userProgress} / {challenge.target}
        </span>
        {!challenge.completed && (
          <span className="text-[11px] text-charcoal/40">
            {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </m.div>
  );
}
