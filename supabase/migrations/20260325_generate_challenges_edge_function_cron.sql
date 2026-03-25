-- ============================================================
-- Migrate weekly challenge generation from Next.js route
-- to Supabase Edge Function.
--
-- Old job: 'weekly-challenge-generation' → POST /api/cron/challenges/generate
-- New job: 'generate-weekly-challenges'  → Edge Function (same schedule)
--
-- Schedule: every Monday at 00:01 UTC  (cron: 1 0 * * 1)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old job that called the Next.js route
SELECT cron.unschedule('weekly-challenge-generation')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-challenge-generation'
);

-- Remove new job if it already exists (safe re-run)
SELECT cron.unschedule('generate-weekly-challenges')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-weekly-challenges'
);

-- Schedule Edge Function call every Monday at 00:01 UTC
SELECT cron.schedule(
  'generate-weekly-challenges',
  $$1 0 * * 1$$,
  $$
  SELECT net.http_post(
    url     := 'https://rnlbbnluoxydtqviwtqj.supabase.co/functions/v1/generate-weekly-challenges',
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
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'generate-weekly-challenges')
--   ORDER BY start_time DESC LIMIT 10;
--
-- Unschedule:
--   SELECT cron.unschedule('generate-weekly-challenges');
-- ============================================================
