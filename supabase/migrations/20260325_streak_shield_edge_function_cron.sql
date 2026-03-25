-- ============================================================
-- Migrate daily streak shield check from Next.js route
-- to Supabase Edge Function.
--
-- Old job: 'daily-streak-shield-check' → POST /api/cron/streaks
-- New job: 'daily-streak-shield-check' → Edge Function (same schedule)
--
-- Schedule: every day at 00:05 UTC  (cron: 5 0 * * *)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old job that called the Next.js route (same name — safe replace)
SELECT cron.unschedule('daily-streak-shield-check')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-streak-shield-check'
);

-- Schedule Edge Function call every day at 00:05 UTC
SELECT cron.schedule(
  'daily-streak-shield-check',
  $$5 0 * * *$$,
  $$
  SELECT net.http_post(
    url     := 'https://rnlbbnluoxydtqviwtqj.supabase.co/functions/v1/daily-streak-shield-check',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || get_supabase_anon_key()
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================================
-- Monitor
-- ============================================================
-- View all cron jobs:
--   SELECT * FROM cron.job;
--
-- View execution history:
--   SELECT * FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-shield-check')
--   ORDER BY start_time DESC LIMIT 10;
--
-- Unschedule:
--   SELECT cron.unschedule('daily-streak-shield-check');
-- ============================================================
