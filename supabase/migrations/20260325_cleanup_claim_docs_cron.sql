-- ============================================================
-- Schedule cleanup-claim-docs Edge Function via pg_cron.
-- Runs daily at 02:00 UTC; deletes expired business_claim_documents
-- (storage + DB rows) and calls cleanup_expired_business_claim_otp.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing job with this name (safe replace)
SELECT cron.unschedule('cleanup-claim-docs')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-claim-docs'
);

-- Schedule Edge Function call every day at 02:00 UTC
SELECT cron.schedule(
  'cleanup-claim-docs',
  $$0 2 * * *$$,
  $$
  SELECT net.http_post(
    url     := 'https://rnlbbnluoxydtqviwtqj.supabase.co/functions/v1/cleanup-claim-docs',
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
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-claim-docs')
--   ORDER BY start_time DESC LIMIT 10;
--
-- Unschedule:
--   SELECT cron.unschedule('cleanup-claim-docs');
-- ============================================================
