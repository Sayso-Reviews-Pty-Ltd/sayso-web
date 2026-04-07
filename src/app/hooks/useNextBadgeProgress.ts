"use client";

import useSWR from "swr";
import { swrConfig } from "@/app/lib/swrConfig";
import type { BadgeRuleType } from "@/app/lib/types/badges";
import type { UserStats } from "@/app/lib/types/user";
import { getBadgePngPath } from "@/app/lib/badgeMappings";

export interface BadgeProgressItem {
  badgeId: string;
  name: string;
  description: string;
  iconPath: string;
  ruleType: BadgeRuleType;
  current: number;
  required: number;
  percent: number;
  remaining: number;
  actionLabel: string;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

const ACTION_LABEL: Partial<Record<BadgeRuleType, string>> = {
  review_count: "reviews",
  category_review_count: "reviews in this category",
  distinct_category_count: "categories reviewed",
  photo_count: "reviews with photos",
  helpful_votes_total: "helpful votes given",
  helpful_votes_received: "helpful votes received",
  streak_days: "day streak",
  weekly_streak: "week streak",
  loyal_reviewer: "reviews at one business",
};

function calculateProgress(
  ruleType: BadgeRuleType,
  threshold: number,
  stats: UserStats
): { current: number; required: number; percent: number; remaining: number } {
  let current = 0;
  switch (ruleType) {
    case "review_count":
    case "category_review_count":
    case "loyal_reviewer":
      current = stats.totalReviewsWritten;
      break;
    case "distinct_category_count":
      current = stats.distinctCategories ?? 0;
      break;
    case "photo_count":
      current = stats.photoCount ?? 0;
      break;
    case "helpful_votes_total":
      current = stats.totalHelpfulVotesGiven;
      break;
    case "helpful_votes_received":
      current = stats.helpfulVotesReceived;
      break;
    default:
      current = 0;
  }
  const required = threshold;
  const percent = clamp(required > 0 ? Math.round((current / required) * 100) : 0, 0, 100);
  return { current, required, percent, remaining: Math.max(0, required - current) };
}

async function fetchAllBadges(userId: string) {
  const res = await fetch(`/api/badges/user?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch badges");
  return res.json();
}

async function fetchStats() {
  const res = await fetch("/api/user/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  return json.data as UserStats;
}

export function useNextBadgeProgress(userId: string | undefined) {
  const { data: badgeData } = useSWR(
    userId ? ["badges-all", userId] : null,
    () => fetchAllBadges(userId!),
    { ...swrConfig, dedupingInterval: 60_000 }
  );

  const { data: stats } = useSWR(userId ? "/api/user/stats" : null, fetchStats, {
    ...swrConfig,
    dedupingInterval: 30_000,
  });

  if (!badgeData?.badges || !stats) return { nearestBadges: [], isLoading: !badgeData || !stats };

  const unearnedBadges: BadgeProgressItem[] = (badgeData.badges as any[])
    .filter((b) => !b.earned && b.threshold != null && b.rule_type)
    .map((b) => {
      const prog = calculateProgress(b.rule_type as BadgeRuleType, b.threshold, stats);
      return {
        badgeId: b.id,
        name: b.name,
        description: b.description,
        iconPath: getBadgePngPath(b.id),
        ruleType: b.rule_type as BadgeRuleType,
        actionLabel: ACTION_LABEL[b.rule_type as BadgeRuleType] ?? "actions",
        ...prog,
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  return { nearestBadges: unearnedBadges, isLoading: false };
}
