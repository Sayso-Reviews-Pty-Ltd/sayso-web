-- ============================================================
-- Schedule send-event-reminders Edge Function via pg_cron.
-- Runs every 15 minutes; fetches due reminders and creates
-- in-app notifications for each user.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing job with this name (safe replace)
SELECT cron.unschedule('send-event-reminders')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-event-reminders'
);

-- Schedule Edge Function call every 15 minutes
SELECT cron.schedule(
  'send-event-reminders',
  $$*/15 * * * *$$,
  $$
  SELECT net.http_post(
    url     := 'https://rnlbbnluoxydtqviwtqj.supabase.co/functions/v1/send-event-reminders',
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
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-event-reminders')
--   ORDER BY start_time DESC LIMIT 10;
--
-- Unschedule:
--   SELECT cron.unschedule('send-event-reminders');
-- ============================================================
