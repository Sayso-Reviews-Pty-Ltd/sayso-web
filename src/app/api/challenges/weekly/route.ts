import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/app/api/_lib/withAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/weekly
 * Returns active challenges with the authenticated user's progress for each.
 */
export const GET = withUser(async (_req: NextRequest, { user, supabase }) => {
  const { data: challenges, error: challengesError } = await (supabase as any)
    .from("challenges")
    .select(
      "id, title, description, rule_type, category_key, target, reward_xp, starts_at, ends_at"
    )
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (challengesError) {
    console.error("[Challenges API] Error fetching challenges:", challengesError.message);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }

  if (!challenges || challenges.length === 0) {
    return NextResponse.json({ challenges: [] });
  }

  const challengeIds = challenges.map((c) => c.id);

  const { data: progressRows } = await (supabase as any)
    .from("user_challenge_progress")
    .select("challenge_id, progress, completed, completed_at")
    .eq("user_id", user.id)
    .in("challenge_id", challengeIds);

  const progressMap = new Map(((progressRows ?? []) as any[]).map((p) => [p.challenge_id, p]));

  const result = challenges.map((c) => {
    const prog = progressMap.get(c.id);
    return {
      ...c,
      userProgress: prog?.progress ?? 0,
      completed: prog?.completed ?? false,
      completedAt: prog?.completed_at ?? null,
    };
  });

  return NextResponse.json({ challenges: result });
});
