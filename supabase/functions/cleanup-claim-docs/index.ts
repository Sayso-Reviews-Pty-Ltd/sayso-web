// Supabase Edge Function: cleanup-claim-docs
//
// Daily cleanup: deletes expired business_claim_documents (storage + DB rows)
// and calls cleanup_expired_business_claim_otp RPC.
// Schedule via pg_cron once daily at 02:00 UTC
// (see migration 20260325_cleanup_claim_docs_cron.sql).

// @ts-ignore — Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "business-verification";

// @ts-ignore — Deno global
Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase       = createClient(supabaseUrl, serviceRoleKey);

    const { data: expired } = await supabase
      .from("business_claim_documents")
      .select("id, storage_path")
      .lt("delete_after", new Date().toISOString());

    const docList: { id: string; storage_path: string | null }[] = expired ?? [];
    let deletedCount = 0;

    for (const doc of docList) {
      if (doc.storage_path) {
        await supabase.storage.from(BUCKET).remove([doc.storage_path]).catch(() => {});
      }
      await supabase.from("business_claim_documents").delete().eq("id", doc.id);
      deletedCount++;
    }

    const { error: otpError } = await supabase.rpc("cleanup_expired_business_claim_otp");
    if (otpError) {
      console.warn("cleanup_expired_business_claim_otp:", otpError);
    }

    return Response.json({
      ok:                true,
      deleted_documents: deletedCount,
      message:           `Cleaned up ${deletedCount} expired claim document(s).`,
    });
  } catch (err) {
    console.error("Cleanup claim docs error:", err);
    return Response.json({ error: "Cleanup failed" }, { status: 500 });
  }
});
