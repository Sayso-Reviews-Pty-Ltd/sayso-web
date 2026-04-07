import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/app/api/_lib/withAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/xp
 * Returns the authenticated user's XP and level data.
 */
export const GET = withUser(async (_req: NextRequest, { user, supabase }) => {
  const { data, error } = await (supabase as any)
    .from("user_xp")
    .select("total_xp, current_level, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[XP API] Error fetching user XP:", error.message);
    return NextResponse.json({ total_xp: 0, current_level: 1, updated_at: null });
  }

  return NextResponse.json({
    total_xp: data?.total_xp ?? 0,
    current_level: data?.current_level ?? 1,
    updated_at: data?.updated_at ?? null,
  });
});
