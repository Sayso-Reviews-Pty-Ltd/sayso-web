'use client';

import useSWR from 'swr';
import { swrConfig } from '@/app/lib/swrConfig';

export interface UserStreakData {
  currentStreak:  number;
  longestStreak:  number;
  lastReviewDate: string | null;
  shieldActive:   boolean;
  isPersonalBest: boolean;
  nextMilestone:  number;
  percentToMilestone: number;
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function nextMilestoneFor(streak: number): number {
  return STREAK_MILESTONES.find((m) => m > streak) ?? 100;
}

async function fetchStreak() {
  const res = await fetch('/api/user/streak');
  if (!res.ok) throw new Error('Failed to fetch streak');
  return res.json();
}

export function useUserStreak(): UserStreakData {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user/streak',
    fetchStreak,
    { ...swrConfig, dedupingInterval: 30_000 }
  );

  const current  = data?.current_streak  ?? 0;
  const longest  = data?.longest_streak  ?? 0;
  const next     = nextMilestoneFor(current);
  const prev     = STREAK_MILESTONES.slice().reverse().find((m) => m <= current) ?? 0;
  const pct      = next > prev ? Math.min(100, Math.round(((current - prev) / (next - prev)) * 100)) : 100;

  return {
    currentStreak:      current,
    longestStreak:      longest,
    lastReviewDate:     data?.last_review_date ?? null,
    shieldActive:       data?.shield_active    ?? false,
    isPersonalBest:     current > 0 && current >= longest,
    nextMilestone:      next,
    percentToMilestone: pct,
    isLoading,
    error: error ? String(error.message ?? error) : null,
    mutate,
  };
}
