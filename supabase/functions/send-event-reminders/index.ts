// Supabase Edge Function: send-event-reminders
//
// Fetches due event_reminders (remind_at <= now, sent=false, limit 100),
// creates an event_reminder notification for each user, then marks them sent.
// Schedule via pg_cron every 15 minutes
// (see migration 20260325_send_event_reminders_cron.sql).

// @ts-ignore — Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore — Deno global
Deno.serve(async (_req: Request) => {
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase       = createClient(supabaseUrl, serviceRoleKey);

  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("event_reminders")
    .select("id, user_id, event_id, event_title, remind_before")
    .lte("remind_at", now)
    .eq("sent", false)
    .limit(100);

  if (error) {
    console.error("[send-event-reminders] fetch error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!due?.length) {
    return Response.json({ sent: 0 });
  }

  let sent = 0;
  const sentIds: string[] = [];

  for (const reminder of due) {
    const label     = reminder.remind_before === "1_day" ? "tomorrow" : "in 2 hours";
    const eventPath = `/event/${reminder.event_id}`;

    // Duplicate check: skip if a notification for this user + event already exists
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", reminder.user_id)
      .eq("type", "event_reminder")
      .eq("entity_id", reminder.event_id)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from("notifications")
        .insert({
          user_id:   reminder.user_id,
          type:      "event_reminder",
          title:     "Event Reminder",
          message:   `"${reminder.event_title}" starts ${label}. Don't miss it!`,
          entity_id: reminder.event_id,
          link:      eventPath,
          read:      false,
        });
    }

    sentIds.push(reminder.id);
    sent++;
  }

  if (sentIds.length) {
    await supabase
      .from("event_reminders")
      .update({ sent: true })
      .in("id", sentIds);
  }

  return Response.json({ sent });
});
