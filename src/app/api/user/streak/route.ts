import { NextRequest, NextResponse } from 'next/server';
import { withUser } from '@/app/api/_lib/withAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/streak
 * Returns the authenticated user's streak data.
 */
export const GET = withUser(async (_req: NextRequest, { user, supabase }) => {
  const { data, error } = await (supabase as any)
    .from('user_streaks')
    .select('current_streak, longest_streak, last_review_date, shield_active, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[Streak API] Error fetching streak:', error.message);
    return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 });
  }

  return NextResponse.json({
    current_streak:   data?.current_streak   ?? 0,
    longest_streak:   data?.longest_streak   ?? 0,
    last_review_date: data?.last_review_date ?? null,
    shield_active:    data?.shield_active    ?? false,
    updated_at:       data?.updated_at       ?? null,
  });
});
