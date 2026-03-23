'use client';

import useSWR from 'swr';
import { swrConfig } from '@/app/lib/swrConfig';

export interface WeeklyChallenge {
  id:           string;
  title:        string;
  description:  string;
  rule_type:    string;
  category_key: string | null;
  target:       number;
  reward_xp:    number;
  starts_at:    string;
  ends_at:      string;
  userProgress: number;
  completed:    boolean;
  completedAt:  string | null;
}

async function fetchChallenges(): Promise<WeeklyChallenge[]> {
  const res = await fetch('/api/challenges/weekly');
  if (!res.ok) throw new Error('Failed to fetch challenges');
  const json = await res.json();
  return json.challenges ?? [];
}

export function useWeeklyChallenges(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<WeeklyChallenge[]>(
    userId ? '/api/challenges/weekly' : null,
    fetchChallenges,
    { ...swrConfig, dedupingInterval: 30_000 }
  );

  return {
    challenges: data ?? [],
    isLoading,
    error: error ? String(error.message ?? error) : null,
    mutate,
  };
}
