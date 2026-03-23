-- ============================================================
-- pg_cron: generate weekly challenges every Monday 00:01
-- Calls /api/cron/challenges/generate (Next.js route handler)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('weekly-challenge-generation')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-challenge-generation'
);

SELECT cron.schedule(
  'weekly-challenge-generation',
  $$1 0 * * 1$$,
  format(
    $$
    SELECT net.http_post(
      url     := '%s/api/cron/challenges/generate',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
      ),
      body    := '{}'::jsonb
    ) AS request_id;
    $$,
    current_setting('app.site_url', true)
  )
);
