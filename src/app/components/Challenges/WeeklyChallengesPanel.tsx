'use client';

import { useWeeklyChallenges } from '@/app/hooks/useWeeklyChallenges';
import WeeklyChallengeCard from './WeeklyChallengeCard';

interface WeeklyChallengesPanelProps {
  userId: string | undefined;
}

function daysUntilSunday(): number {
  const today = new Date().getDay(); // 0=Sun
  return today === 0 ? 0 : 7 - today;
}

export default function WeeklyChallengesPanel({ userId }: WeeklyChallengesPanelProps) {
  const { challenges, isLoading } = useWeeklyChallenges(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl bg-white/10 h-20" />
        ))}
      </div>
    );
  }

  if (challenges.length === 0) return null;

  const resets = daysUntilSunday();

  return (
    <section className="font-urbanist" aria-label="Weekly challenges">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-700 text-white">This Week&apos;s Challenges</h3>
        <span className="text-xs text-white/60">
          {resets === 0 ? 'Resets tonight' : `Resets in ${resets}d`}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {challenges.map((c, i) => (
          <WeeklyChallengeCard key={c.id} challenge={c} index={i} />
        ))}
      </div>
    </section>
  );
}
