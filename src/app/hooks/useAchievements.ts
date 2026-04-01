/**
 * Hook to fetch the full achievements/badge data for the current user.
 * Returns grouped badges by category and aggregate stats.
 */

"use client";

import useSWR from "swr";
import { useAuth } from "../contexts/AuthContext";
import { swrConfig } from "../lib/swrConfig";
import type { Badge } from "../components/Badges/BadgeCard";

export interface BadgeStats {
  total: number;
  earned: number;
  percentage: number;
}

export interface GroupedBadges {
  explorer: Badge[];
  specialist: Badge[];
  milestone: Badge[];
  community: Badge[];
}

interface AchievementsData {
  grouped: GroupedBadges;
  stats: BadgeStats;
}

async function fetchAchievements(url: string): Promise<AchievementsData> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch badges");
  return response.json();
}

export function useAchievements() {
  const { user } = useAuth();
  const swrKey = user ? `/api/badges/user?user_id=${user.id}` : null;

  const { data, isLoading, error } = useSWR(swrKey, fetchAchievements, swrConfig);

  return {
    grouped: data?.grouped ?? null,
    stats: data?.stats ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
