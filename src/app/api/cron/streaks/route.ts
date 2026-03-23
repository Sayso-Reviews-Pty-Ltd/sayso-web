import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/app/lib/admin';

export const dynamic     = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/streaks
 * Daily cron (00:05) — consume streak shields for users who missed yesterday,
 * or reset current_streak to 0 for users who missed two+ days without a shield.
 *
 * Invoked by pg_cron via HTTP (see migration 20260323_streak_shield_cron.sql).
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = getServiceSupabase();
  const today      = new Date();
  const yesterday  = new Date(today); yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

  const todayStr      = today.toISOString().slice(0, 10);
  const yesterdayStr  = yesterday.toISOString().slice(0, 10);
  const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

  // Fetch all streaks that haven't been updated today or yesterday
  const { data: staleRows, error } = await (supabase as any)
    .from('user_streaks')
    .select('user_id, current_streak, shield_active, last_review_date')
    .lt('last_review_date', yesterdayStr);

  if (error) {
    console.error('[Streaks Cron] Failed to fetch stale rows:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let shieldConsumed = 0;
  let streaksReset   = 0;

  for (const row of staleRows ?? []) {
    if (row.shield_active && row.last_review_date === twoDaysAgoStr) {
      // Consume shield — streak survives one more day
      await (supabase as any)
        .from('user_streaks')
        .update({ shield_active: false, shield_used_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('user_id', row.user_id);
      shieldConsumed++;
    } else if (row.current_streak > 0) {
      // Reset streak
      await (supabase as any)
        .from('user_streaks')
        .update({ current_streak: 0, shield_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', row.user_id);
      streaksReset++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: (staleRows ?? []).length,
    shieldConsumed,
    streaksReset,
    date: todayStr,
  });
}
