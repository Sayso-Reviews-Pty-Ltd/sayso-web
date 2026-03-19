import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/app/lib/supabase/server";
import { applyPrivateCachePolicy } from "@/app/lib/cachePolicy";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase(req);
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data?.session?.user) {
      return applyPrivateCachePolicy(
        NextResponse.json(
          {
            refreshed: false,
            error: error?.message ?? "Unable to refresh session",
          },
          { status: 401 },
        ),
      );
    }

    return applyPrivateCachePolicy(
      NextResponse.json({
        refreshed: true,
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          email_verified: Boolean(data.session.user.email_confirmed_at),
        },
      }),
    );
  } catch (error) {
    return applyPrivateCachePolicy(
      NextResponse.json(
        { refreshed: false, error: error instanceof Error ? error.message : "Refresh failed" },
        { status: 500 },
      ),
    );
  }
}
