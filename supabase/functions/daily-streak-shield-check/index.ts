// Supabase Edge Function: daily-streak-shield-check
//
// Runs daily at 00:05 UTC. For every user whose streak is stale:
//   - Consumes their shield if they missed exactly yesterday (last_review_date === two days ago)
//   - Resets current_streak to 0 otherwise (missed 2+ days, or no shield)
//
// Schedule via pg_cron every day at 00:05 UTC
// (see migration 20260325_streak_shield_edge_function_cron.sql).

// @ts-ignore — Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore — Deno global
Deno.serve(async (_req: Request) => {
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase       = createClient(supabaseUrl, serviceRoleKey);

  const today      = new Date();
  const yesterday  = new Date(today); yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

  const todayStr      = today.toISOString().slice(0, 10);
  const yesterdayStr  = yesterday.toISOString().slice(0, 10);
  const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

  // Fetch all streaks not updated today or yesterday
  const { data: staleRows, error } = await supabase
    .from("user_streaks")
    .select("user_id, current_streak, shield_active, last_review_date")
    .lt("last_review_date", yesterdayStr);

  if (error) {
    console.error("[daily-streak-shield-check] Failed to fetch stale rows:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  let shieldConsumed = 0;
  let streaksReset   = 0;

  for (const row of staleRows ?? []) {
    if (row.shield_active && row.last_review_date === twoDaysAgoStr) {
      // Missed exactly one day — consume shield, streak survives
      await supabase
        .from("user_streaks")
        .update({
          shield_active:  false,
          shield_used_at: new Date().toISOString(),
          updated_at:     new Date().toISOString(),
        })
        .eq("user_id", row.user_id);
      shieldConsumed++;
    } else if (row.current_streak > 0) {
      // Missed two or more days — reset streak
      await supabase
        .from("user_streaks")
        .update({
          current_streak: 0,
          shield_active:  false,
          updated_at:     new Date().toISOString(),
        })
        .eq("user_id", row.user_id);
      streaksReset++;
    }
  }

  return Response.json({
    ok:             true,
    processed:      (staleRows ?? []).length,
    shieldConsumed,
    streaksReset,
    date:           todayStr,
  });
});
