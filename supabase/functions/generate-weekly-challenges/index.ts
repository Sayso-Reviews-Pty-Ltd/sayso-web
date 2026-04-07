// Supabase Edge Function: generate-weekly-challenges
//
// Deactivates expired challenges and inserts 3 random challenges for the
// current week. Idempotent — skips if 3+ active challenges already exist.
// Schedule via pg_cron every Monday at 00:01 UTC
// (see migration 20260325_generate_challenges_edge_function_cron.sql).

// @ts-ignore — Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// Challenge pool — mirrors the Next.js route exactly
// =============================================================================

const CHALLENGE_POOL = [
  {
    title: "Share Your Taste",
    description: "Review 2 food businesses this week.",
    rule_type: "review_count",
    category_key: "food",
    target: 2,
    reward_xp: 30,
  },
  {
    title: "Beauty Scout",
    description: "Review 2 beauty businesses this week.",
    rule_type: "review_count",
    category_key: "beauty",
    target: 2,
    reward_xp: 30,
  },
  {
    title: "Snap & Share",
    description: "Add photos to 3 reviews this week.",
    rule_type: "photo_count",
    category_key: null,
    target: 3,
    reward_xp: 35,
  },
  {
    title: "Helpful Critic",
    description: "Mark 5 reviews as helpful this week.",
    rule_type: "helpful_votes",
    category_key: null,
    target: 5,
    reward_xp: 25,
  },
  {
    title: "Explorer Week",
    description: "Review businesses in 2 different categories.",
    rule_type: "category_count",
    category_key: null,
    target: 2,
    reward_xp: 40,
  },
  {
    title: "Night Out",
    description: "Review 2 entertainment businesses this week.",
    rule_type: "review_count",
    category_key: "entertainment",
    target: 2,
    reward_xp: 30,
  },
  {
    title: "Health Check",
    description: "Review a health & wellness business this week.",
    rule_type: "review_count",
    category_key: "health",
    target: 1,
    reward_xp: 20,
  },
  {
    title: "Neighbourhood Watch",
    description: "Write 3 reviews in any category this week.",
    rule_type: "review_count",
    category_key: null,
    target: 3,
    reward_xp: 35,
  },
  {
    title: "Retail Therapy",
    description: "Review 2 shopping businesses this week.",
    rule_type: "review_count",
    category_key: "shopping",
    target: 2,
    reward_xp: 30,
  },
  {
    title: "Service Reporter",
    description: "Review 2 professional service businesses.",
    rule_type: "review_count",
    category_key: "services",
    target: 2,
    reward_xp: 30,
  },
];

// =============================================================================
// Helpers
// =============================================================================

function getMondayAndSunday(): { monday: Date; sunday: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon…
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

// =============================================================================
// Handler
// =============================================================================

// @ts-ignore — Deno global
Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { monday, sunday } = getMondayAndSunday();

  // 1. Deactivate challenges that ended before this Monday
  await supabase
    .from("challenges")
    .update({ is_active: false })
    .lt("ends_at", monday.toISOString());

  // 2. Idempotency — skip if this week's challenges already exist
  const { data: existing } = await supabase
    .from("challenges")
    .select("id")
    .eq("is_active", true)
    .gte("starts_at", monday.toISOString());

  if (existing && existing.length >= 3) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: "Challenges already generated for this week",
    });
  }

  // 3. Pick 3 random challenges from the pool
  const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);

  const rows = shuffled.map((c) => ({
    ...c,
    starts_at: monday.toISOString(),
    ends_at: sunday.toISOString(),
    is_active: true,
  }));

  const { data: inserted, error } = await supabase
    .from("challenges")
    .insert(rows)
    .select("id, title");

  if (error) {
    console.error("[generate-weekly-challenges] Insert failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    inserted: inserted?.length ?? 0,
    challenges: inserted,
  });
});
