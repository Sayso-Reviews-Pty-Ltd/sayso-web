-- ==========================================================================
-- sync_event_rsvp_counts: aggregates event_rsvps → events_and_specials.guestlist_count
--
-- Called every 15 minutes by the sync-rsvp-counts edge function.
-- Supports a backfill mode (p_backfill = true) that also resets community
-- events with no RSVPs back to 0. External events (quicket / ticketmaster)
-- are intentionally excluded from the reset — their counts are managed by
-- the ingest crons.
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.sync_event_rsvp_counts(p_backfill boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int    := 0;
  v_reset   int    := 0;
  v_total   bigint := 0;
BEGIN
  -- Step 1: update guestlist_count for every event that has at least one RSVP.
  -- event_rsvps.event_id is stored as text (UUID string); cast to uuid for the join.
  WITH rsvp_counts AS (
    SELECT
      event_id::uuid  AS eid,
      COUNT(*)::int   AS cnt
    FROM event_rsvps
    WHERE event_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    GROUP BY event_id
  ),
  upd AS (
    UPDATE events_and_specials e
    SET
      guestlist_count = rc.cnt,
      updated_at      = now()
    FROM rsvp_counts rc
    WHERE e.id = rc.eid
    RETURNING e.id, rc.cnt
  )
  SELECT COUNT(*)::int, COALESCE(SUM(cnt), 0)::bigint
  INTO v_updated, v_total
  FROM upd;

  -- Step 2 (backfill only): reset community events that previously had a count
  -- but now have zero RSVPs back to 0. Quicket and Ticketmaster events are
  -- excluded here — their counts come from the external API ingest crons.
  IF p_backfill THEN
    WITH reset_ids AS (
      UPDATE events_and_specials
      SET
        guestlist_count = 0,
        updated_at      = now()
      WHERE
        icon NOT IN ('quicket', 'ticketmaster')
        AND guestlist_count > 0
        AND id NOT IN (
          SELECT event_id::uuid
          FROM event_rsvps
          WHERE event_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        )
      RETURNING id
    )
    SELECT COUNT(*)::int INTO v_reset FROM reset_ids;
  END IF;

  RETURN jsonb_build_object(
    'updated',     v_updated,
    'reset',       v_reset,
    'total_rsvps', v_total
  );
END;
$$;

-- ==========================================================================
-- pg_cron: run the sync every 15 minutes via the edge function.
-- The edge function calls sync_event_rsvp_counts() via RPC so it can be
-- triggered manually with ?backfill=true for a full historical backfill.
-- ==========================================================================

SELECT cron.schedule(
  'sync-rsvp-counts',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://rnlbbnluoxydtqviwtqj.supabase.co/functions/v1/sync-rsvp-counts',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || get_supabase_anon_key()
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
