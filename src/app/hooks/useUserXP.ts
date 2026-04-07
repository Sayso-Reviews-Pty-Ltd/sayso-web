"use client";

import useSWR from "swr";
import { swrConfig } from "@/app/lib/swrConfig";
import { currentLevelFromXP, type LevelState } from "@/app/lib/xp/levels";

interface RawXPData {
  total_xp: number;
  current_level: number;
  updated_at: string | null;
}

export interface UserXPData extends LevelState {
  totalXP: number;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

async function fetchXP(): Promise<RawXPData> {
  const res = await fetch("/api/user/xp");
  if (!res.ok) throw new Error("Failed to fetch XP");
  return res.json();
}

export function useUserXP(): UserXPData {
  const { data, error, isLoading, mutate } = useSWR<RawXPData>("/api/user/xp", fetchXP, {
    ...swrConfig,
    dedupingInterval: 30_000,
  });

  const levelState = currentLevelFromXP(data?.total_xp ?? 0);

  return {
    ...levelState,
    totalXP: data?.total_xp ?? 0,
    updatedAt: data?.updated_at ?? null,
    isLoading,
    error: error ? String(error.message ?? error) : null,
    mutate,
  };
}
