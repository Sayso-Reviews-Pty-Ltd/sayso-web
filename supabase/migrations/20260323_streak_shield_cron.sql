-- ============================================================
-- pg_cron: daily streak shield check at 00:05
-- Calls /api/cron/streaks (Next.js route handler)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('daily-streak-shield-check')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-streak-shield-check'
);

SELECT cron.schedule(
  'daily-streak-shield-check',
  $$5 0 * * *$$,
  format(
    $$
    SELECT net.http_post(
      url     := '%s/api/cron/streaks',
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
