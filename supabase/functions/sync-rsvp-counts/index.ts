// Supabase Edge Function: sync RSVP counts → events_and_specials.guestlist_count
//
// Counts rows in event_rsvps per event and writes the total back to
// events_and_specials.guestlist_count for each matched event.
//
// Query params:
//   ?backfill=true  — also resets community events with no RSVPs back to 0
//                     (skips quicket / ticketmaster events, which manage their
//                      own counts via the ingest crons).
//
// Schedule: every 15 minutes via pg_cron (see migration 20260326_sync_rsvp_counts_cron.sql).

// @ts-ignore — Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function jsonOk(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// @ts-ignore — Deno.serve
Deno.serve(async (req: Request) => {
  const startMs = Date.now();

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonError("Supabase credentials not configured");
    }

    const url = new URL(req.url);
    const backfill = url.searchParams.get("backfill") === "true";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.rpc("sync_event_rsvp_counts", {
      p_backfill: backfill,
    });

    if (error) {
      console.error("[sync-rsvp-counts] RPC error:", error.message);
      return jsonError(error.message);
    }

    const result = Array.isArray(data) ? data[0] : data;
    const metrics = {
      success: true,
      backfill,
      events_updated: result?.updated ?? 0,
      events_reset: result?.reset ?? 0,
      total_rsvps: result?.total_rsvps ?? 0,
      elapsed_ms: Date.now() - startMs,
      timestamp: new Date().toISOString(),
    };

    console.log("[sync-rsvp-counts] Complete:", metrics);
    return jsonOk(metrics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync-rsvp-counts] Fatal: ${message}`);
    return jsonError(message, 500);
  }
});
